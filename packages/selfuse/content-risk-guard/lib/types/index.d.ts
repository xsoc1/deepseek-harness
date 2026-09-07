import type { Context } from 'cordis';
import z from 'schemastery';
export declare const name = "@dsh-selfuse/content-risk-guard";
export declare const inject: {
    required: string[];
    optional: string[];
};
export interface Config {
    enabled?: boolean;
    autoRetry?: boolean;
    sanitizeToolResults?: boolean;
}
export declare const Config: z<Config>;
export declare function apply(ctx: Context, config?: Config): void;
