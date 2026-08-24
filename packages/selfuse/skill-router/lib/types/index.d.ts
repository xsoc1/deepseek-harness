/**
 * @dsh-selfuse/skill-router — 全局技能路由提示段。
 *
 * 职责：往每个会话的 system prompt 注入一张浓缩技能路由表（任务桶 + 中英触发词 +
 * 流程铁律），让 35 个 mattpocock 技能 + 4 个数学技能在日常中文对话中被正确触发，
 * 大任务自动走 grill → spec/tickets → implement → review 主流程。
 *
 * 机制：ctx.systemPrompt.section 注入提示段。
 * 零工具、零依赖；纯提示段，卸载即净。
 */
import type { Context } from 'cordis';
import z from 'schemastery';
export declare const name = "@dsh-selfuse/skill-router";
export declare const inject: string[];
export interface Config {
    enabled: boolean;
}
export declare const Config: z<Schemastery.ObjectS<{
    enabled: z<boolean, boolean>;
}>, Schemastery.ObjectT<{
    enabled: z<boolean, boolean>;
}>>;
export declare function apply(ctx: Context, config: Config): void;
