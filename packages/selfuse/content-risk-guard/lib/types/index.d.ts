import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { type LocalNetworkProfile } from './local-network-profile.js';
export declare const name = "@dsh-selfuse/content-risk-guard";
export declare const inject: string[];
export interface Config {
    enabled?: boolean;
    privateRoot?: string;
    retentionHours?: number;
    maxStoredBytes?: number;
    profiles?: LocalNetworkProfile[];
}
export declare const Config: z<Config>;
export declare function apply(ctx: Context, config?: Config): void;
//# sourceMappingURL=index.d.ts.map