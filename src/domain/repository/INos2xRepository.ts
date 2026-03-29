import type { NostrEvent, RelayConfig, UnsignedEvent } from "../model/nostr";

export interface INos2xRepository {
	getPublicKey(): Promise<string>;
	getLocalRelays(): Promise<RelayConfig[]>;
	signEvent(event: UnsignedEvent): Promise<NostrEvent>;
}
