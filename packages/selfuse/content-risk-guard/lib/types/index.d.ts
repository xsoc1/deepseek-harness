import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { type LocalNetworkProfile } from './local-network-profile.js';
export declare const name = "@dsh-selfuse/content-risk-guard";
export declare const inject: string[];
/** Local-only isolation settings; profile paths and retained text never enter model output. */
export interface Config {
    /** Disable local isolation only when an owner intentionally removes this guard. */
    enabled?: boolean;
    /** Absolute, owner-only directory for retained results and profile backups. */
    privateRoot?: string;
    /** Maximum age of a locally retained result before it expires. */
    retentionHours?: number;
    /** Maximum UTF-8 byte size of a retained result or allowlisted profile. */
    maxStoredBytes?: number;
    /** Allowlisted local YAML profiles addressable only by non-secret aliases. */
    profiles?: LocalNetworkProfile[];
}
export declare const Config: z<Config>;
export declare function apply(ctx: Context, config?: Config): void;
//# sourceMappingURL=index.d.ts.map