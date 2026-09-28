/**
 * Slot contract for the prebuilt Web UI settings group. The shipped client
 * bundle declares `web-ui.plugin.item` when its Plugins section mounts;
 * sibling cards consume that seat but must not declare it independently.
 */
import type {} from '@deepseek-ai/dsh-client-ui-slots'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /**
     * One card in the Web UI Plugins settings group. A registrant supplies
     * its own card and id; the group passes no owner data. The seat is absent
     * when the Web UI settings group is not mounted.
     */
    'web-ui.plugin.item': { kind: 'list'; scope: 'root'; owner: WebUiPluginItemOwnerProps }
  }
}

/** Owner share of a plugin card: the group supplies no props. */
export interface WebUiPluginItemOwnerProps {
  /** Marker field; cards render their own content. */
  children?: never
}
