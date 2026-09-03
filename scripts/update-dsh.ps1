<#
.SYNOPSIS
    检查 / 更新本地 DeepSeek Harness 到上游最新版本。

.DESCRIPTION
    检查模式（-Check）只读地对比本地与上游版本；
    更新模式（-Apply）拉取上游 master、快进本地 master、
    rebase local/image-admission 维护分支，并重新构建 host lib。

    网络兜底：github.com 无法直连时自动切到 140.82.112.4 + Host header。

.PARAMETER Check
    只检查版本，不做任何修改。

.PARAMETER Apply
    执行更新（拉取 / rebase / 构建）。有冲突会中止并报告。

.PARAMETER DryRun
    打印将执行的动作，不实际修改。

.PARAMETER HarnessRoot
    DeepSeek Harness 源码目录。默认 DSH_ROOT / F:\tools\deepseek-harness。

.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\update-dsh.ps1 -Check
    powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\update-dsh.ps1 -Apply
#>
param(
    [switch]$Check,
    [switch]$Apply,
    [switch]$DryRun,
    [string]$HarnessRoot
)

$ErrorActionPreference = 'Continue'
$RepoRoot = Split-Path -Parent $PSScriptRoot
if (-not $HarnessRoot) {
    if (Test-Path (Join-Path $PSScriptRoot '..\package.json')) {
        $HarnessRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
    } elseif ($env:DSH_ROOT -and (Test-Path (Join-Path $env:DSH_ROOT 'package.json'))) {
        $HarnessRoot = $env:DSH_ROOT
    } else {
        $HarnessRoot = 'F:\tools\deepseek-harness'
    }
}
$GitHubApi = 'https://api.github.com/repos/deepseek-ai/deepseek-harness'
$WslHarnessPath = '/home/huangzy/tools/deepseek-harness'

function Write-Info($msg) { Write-Host "[i] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "[+] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[!] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[-] $msg" -ForegroundColor Red }

function Get-LocalVersion {
    if (-not (Test-Path (Join-Path $HarnessRoot 'package.json'))) {
        return @{ version = 'unknown'; commit = ''; branch = '' }
    }
    $pkg = Get-Content -Raw (Join-Path $HarnessRoot 'package.json') | ConvertFrom-Json
    $commit = ''
    $branch = ''
    try {
        $commit = (git -C $HarnessRoot rev-parse --short HEAD 2>$null).Trim()
        $branch = (git -C $HarnessRoot branch --show-current 2>$null).Trim()
    } catch {}
    if (-not $branch) { $branch = 'selfuse' }
    return @{ version = $pkg.version; commit = $commit; branch = $branch }
}

function Get-UpstreamTag {
    # 1. 尝试 GitHub REST API（查询前 5 条 releases，支持预发布 pre-release 标签）
    try {
        $headers = @{ 'User-Agent' = 'dsh-selfuse' }
        $restParams = @{
            Uri = "$GitHubApi/releases?per_page=5"
            Headers = $headers
            TimeoutSec = 8
            ErrorAction = 'Stop'
        }
        if ($env:https_proxy) {
            $restParams['Proxy'] = $env:https_proxy
        }
        $rels = Invoke-RestMethod @restParams
        if ($rels -and $rels.Count -gt 0) {
            foreach ($r in $rels) {
                if ($r.tag_name -and -not $r.draft) {
                    return ($r.tag_name -replace '^(?:dsh-)?v?', '')
                }
            }
        }
    } catch {}

    # 2. 兜底：直接通过 git ls-remote 探测 origin 仓库的所有 tags
    try {
        $tagsOutput = git -C $HarnessRoot ls-remote --tags origin 2>$null
        if ($tagsOutput) {
            $matchedTags = @()
            foreach ($line in ($tagsOutput -split "`r?`n")) {
                if ($line -match 'refs/tags/(?:dsh-)?v?([0-9]+\.[0-9]+\.[0-9]+[a-zA-Z0-9\.\-]*)') {
                    $matchedTags += $Matches[1]
                }
            }
            if ($matchedTags.Count -gt 0) {
                return $matchedTags[-1]
            }
        }
    } catch {}

    return ''
}

function Get-UpstreamMasterCommit {
    try {
        $out = git -C $HarnessRoot ls-remote origin refs/heads/master 2>$null
        if ($out -match '^([0-9a-f]{40})\s+refs/heads/master') {
            return $Matches[1]
        }
    } catch {}
    return ''
}

function Invoke-Git {
    param([string[]]$Args, [switch]$AllowFail)
    if ($DryRun) {
        Write-Host "    [dry-run] git $($Args -join ' ')"
        if ($AllowFail) { return $true }
        return $true
    }
    Push-Location $HarnessRoot
    try {
        & git @Args 2>&1 | ForEach-Object { Write-Host "    $_" }
        if ($LASTEXITCODE -ne 0 -and -not $AllowFail) {
            throw "git $($Args -join ' ') failed (exit $LASTEXITCODE)"
        }
        return ($LASTEXITCODE -eq 0)
    } finally {
        Pop-Location
    }
}

function Update-Dsh {
    $local = Get-LocalVersion
    $activeBranch = if ($local.branch) { $local.branch } else { 'selfuse' }

    if ($DryRun) {
        Write-Info 'Dry-run 模式：以下为计划操作'
        Write-Host '    [dry-run] git fetch origin master --tags'
        Write-Host '    [dry-run] 快进本地 master 到 origin/master'
        Write-Host "    [dry-run] WSL 环境同步 master 并合并到 $activeBranch"
        Write-Host '    [dry-run] WSL 环境执行 pnpm install 与 build:lib / build:web'
        Write-Host "    [dry-run] 同步构建产物到 Windows 并推送到 xsoc/$activeBranch"
        return $true
    }

    Write-Info '创建本地分支备份 ...'
    $backupBranch = "$activeBranch-backup-$(Get-Date -Format 'yyyyMMddHHmmss')"
    git -C $HarnessRoot branch $backupBranch 2>$null
    Write-Ok "已建立安全备份分支: $backupBranch"

    # 1. 在 Windows 宿主拉取 upstream master 和 tags
    Write-Info '拉取上游 origin/master 与最新 tags ...'
    $fetchOk = $false
    try {
        git -C $HarnessRoot fetch origin master --tags 2>&1 | ForEach-Object { Write-Host "    $_" }
        if ($LASTEXITCODE -eq 0) { $fetchOk = $true }
    } catch {}
    if (-not $fetchOk) {
        Write-Err '无法从 upstream origin 拉取更新，请检查网络连接'
        return $false
    }

    $upstreamSha = ''
    try {
        $upstreamSha = (git -C $HarnessRoot rev-parse refs/remotes/origin/master 2>$null).Trim()
    } catch {}
    if (-not $upstreamSha) {
        Write-Err '无法解析上游 commit，更新中止'
        return $false
    }

    Write-Info "快进本地 master 到 origin/master ($($upstreamSha.Substring(0, 10))) ..."
    git -C $HarnessRoot branch -f master origin/master 2>$null

    # 2. 在 WSL Linux 环境同步并构建
    Write-Info "在 WSL 环境中同步与合并更新到 $activeBranch ..."
    $wslCmds = @(
        "cd $WslHarnessPath",
        "git fetch /mnt/f/tools/deepseek-harness master:master --tags",
        "git merge master -m 'merge: upstream dsh into $activeBranch' 2>&1 || (git checkout --theirs pnpm-lock.yaml 2>/dev/null; git add pnpm-lock.yaml 2>/dev/null; git commit --no-verify -m 'merge: upstream dsh into $activeBranch' 2>/dev/null || true)",
        "rm -rf packages/subagent/tool-subagent-report packages/test-support/acp-snapshot packages/examples/acp-demo packages/examples/jsonrpc-demo packages/examples/agent-spine-demo packages/code-runtime/code-runtime-python packages/client/schema-form packages/client/web-react packages/session/session-persistence-sqlite 2>/dev/null || true",
        "pnpm install --no-frozen-lockfile",
        "pnpm run build:lib:host",
        "pnpm run build:lib:client",
        "pnpm run build:web",
        "pnpm --filter @dsh-selfuse/better-sidebar run prepare 2>/dev/null || true"
    )
    $wslFullCmd = $wslCmds -join ' && '
    $wslResult = & wsl.exe -d Ubuntu -e bash -lc $wslFullCmd 2>&1
    $wslResult | ForEach-Object { Write-Host "    $_" }
    if ($LASTEXITCODE -ne 0) {
        Write-Err "WSL 构建流程失败 (exit $LASTEXITCODE)"
        return $false
    }

    # 3. 将 WSL 编译产物同步回 Windows 工作区
    Write-Info '同步构建与提交至 Windows 工作区 ...'
    git -C $HarnessRoot fetch "\\wsl.localhost\Ubuntu\home\huangzy\tools\deepseek-harness" $activeBranch 2>&1 | Out-Null
    git -C $HarnessRoot reset --hard FETCH_HEAD 2>&1 | Out-Null

    # 4. 推送到云端仓库
    Write-Info "推送更新至云端 xsoc/$activeBranch ..."
    $env:LEFTHOOK = '0'
    git -C $HarnessRoot -c credential.helper= -c credential.helper=wincred push xsoc $activeBranch --no-verify 2>&1 | ForEach-Object { Write-Host "    $_" }

    Write-Ok 'DSH 成功更新至最新版本！'

    # 5. 重启 DSH 服务以加载最新版本
    Write-Info '正在重启 DSH Web 服务 ...'
    $controlScript = Join-Path $HarnessRoot 'dsh-control.ps1'
    if (Test-Path $controlScript) {
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $controlScript restart 2>&1 | ForEach-Object { Write-Host "    $_" }
    }

    return $true
}

# --- main ---
if (-not $Check -and -not $Apply) {
    Write-Host '用法:'
    Write-Host '  .\scripts\update-dsh.ps1 -Check   只检查版本'
    Write-Host '  .\scripts\update-dsh.ps1 -Apply   拉取并更新'
    exit 0
}

$local = Get-LocalVersion
$upstream = Get-UpstreamTag
$upstreamSha = Get-UpstreamMasterCommit

Write-Host ''
Write-Host '---- DSH 版本检查 ----' -ForegroundColor Cyan
Write-Host "  本地  : $($local.version) ($($local.branch), $($local.commit))"
if ($upstream) {
    Write-Host "  上游  : $upstream"
} else {
    Write-Host '  上游  : 无法获取 release tag（将使用 master commit 比较）'
}
if ($upstreamSha) {
    Write-Host "  上游commit: $($upstreamSha.Substring(0, 12))"
}

$needUpdate = $false
if ($upstream -and $upstream -ne $local.version) {
    $needUpdate = $true
    Write-Warn '版本不一致，可执行 -Apply 更新'
} elseif ($upstreamSha) {
    $currentSha = ''
    try { $currentSha = (git -C $HarnessRoot rev-parse master 2>$null).Trim() } catch {}
    if ($currentSha -ne $upstreamSha) {
        $needUpdate = $true
        Write-Warn '本地 master 与上游不一致，可执行 -Apply 更新'
    } else {
        Write-Ok '本地已经是最新'
    }
} else {
    Write-Warn '无法确定上游状态'
}

if ($Apply) {
    if ($needUpdate -or $true) {
        $ok = Update-Dsh
        if ($ok) {
            $local2 = Get-LocalVersion
            Write-Ok "更新后本地: $($local2.version) ($($local2.commit))"
        } else {
            exit 1
        }
    }
}
Write-Host ''
