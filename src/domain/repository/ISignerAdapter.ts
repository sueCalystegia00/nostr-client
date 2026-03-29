import type { NostrEvent, RelayConfig, UnsignedEvent } from "../model/nostr";

export interface ISignerAdapter {
	getPublicKey(): Promise<string>;
	getLocalRelays(): Promise<RelayConfig[]>;
	signEvent(event: UnsignedEvent): Promise<NostrEvent>;
}
