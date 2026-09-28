import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type RemoteKey } from './locales.ts';
export type { RemoteEntryProps } from './RemoteEntry.tsx';
export type { PanelState, RemotePanelProps } from './RemotePanel.tsx';
export type { PairFailedNoticeProps } from './PairFailedNotice.tsx';
export type { RemoteKey } from './locales.ts';
export type { RemoteSettingsCardFace, RemoteSettingsCardState } from './RemoteSettingsCard.tsx';
export type { UpdateEntryProps } from './UpdateEntry.tsx';
export type { UpdatePanelProps, UpdateView } from './UpdatePanel.tsx';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Remote desktop access copy. */
        remote: RemoteKey;
    }
    interface SlotMap {
        /**
         * The sidebar foot seat beside the settings trigger, declared by the
         * sidebar shell on deployments that carry the feature seat; the shell
         * passes only its column display state.
         */
        'sidebar.remote': {
            kind: 'single';
            scope: 'root';
            owner: SidebarRemoteOwnerProps;
        };
    }
}
/** Owner share of the sidebar remote-control seat: the column display state the trigger renders against. */
export interface SidebarRemoteOwnerProps {
    /** Whether the sidebar renders wide content (false = 56px rail). */
    wide: boolean;
}
/** Services required by this plugin. */
export declare const inject: string[];
/**
 * Register the remote-control surface.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map