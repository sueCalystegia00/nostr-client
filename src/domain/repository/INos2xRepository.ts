import type { NostrEvent, UnsignedEvent } from "nostr-tools/pure";
import type { RelayConfig } from "../model/nostr";

export interface INos2xRepository {
	getPublicKey(): Promise<string>;
	getLocalRelays(): Promise<RelayConfig[]>;
	signEvent(event: UnsignedEvent): Promise<NostrEvent>;
}
