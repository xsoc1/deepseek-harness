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
/** Extract bounded, non-identifying facts from one locally retained result.
 * @param text result held on the local machine.
 * @returns counts and flags without names, endpoints, links, or credentials.
 */
export declare function summarizeRiskContent(text: string): SafeNetworkFacts;
/** Conservative classifier; it does not claim to predict an upstream policy verdict.
 * @param text model-bound or tool-result text to inspect.
 * @returns true for recognized network material or an incomplete nested scan.
 */
export declare function hasSensitiveNetworkContent(text: string): boolean;
//# sourceMappingURL=sanitizer.d.ts.map