import type { NostrEvent, RelayModel } from "../model/nostr";

export interface INostrPostEventRepository {
	fetchEvents(relays: RelayModel[]): Promise<NostrEvent[]>;
	subscribeEvents(
		relays: RelayModel[],
		onEvent: (event: NostrEvent) => void,
	): () => void;
	fetchUserProfiles(
		pubkeys: string[],
		relays: RelayModel[],
	): Promise<NostrEvent[]>;
	fetchUserProfile(
		pubkey: string,
		relays: RelayModel[],
	): Promise<NostrEvent | undefined>;
	postEvent(event: NostrEvent, relays: RelayModel[]): Promise<void>;
}
