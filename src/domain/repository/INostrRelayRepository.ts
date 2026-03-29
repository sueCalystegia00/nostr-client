import type { RelayConfig } from "../model/nostr";

export interface INostrRelayRepository {
	getNetworkRelays(
		pubkey: string,
		bootstrapRelays: string[],
	): Promise<RelayConfig[]>;
}
