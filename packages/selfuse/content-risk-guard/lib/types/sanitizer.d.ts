/** Network configuration facts that contain no names, hosts, links, or credentials. */
export interface SafeNetworkFacts {
    bytes: number;
    proxyEntries: number;
    groupEntries: number;
    protocolLinks: number;
    subscriptionLinks: number;
    hasTunSection: boolean;
    hasDnsSection: boolean;
}
/** Extract bounded, non-identifying facts from one locally retained result. */
export declare function summarizeRiskContent(text: string): SafeNetworkFacts;
/** Conservative classifier; it does not claim to predict an upstream policy verdict. */
export declare function hasSensitiveNetworkContent(text: string): boolean;
//# sourceMappingURL=sanitizer.d.ts.map