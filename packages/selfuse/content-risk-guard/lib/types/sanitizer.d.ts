import type { Message } from '@deepseek-ai/dsh-llm';
export declare function sanitizeRiskContent(text: string): string;
export declare function isContentRiskError(error: unknown): boolean;
export declare function sanitizeMessagesForRisk(messages: readonly Message[]): Message[];
export declare function deepRedactToolResults(messages: readonly Message[]): Message[];
