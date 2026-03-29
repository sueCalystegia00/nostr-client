import type { Event } from "nostr-tools/pure";
import type { RelayModel } from "../model/nostr";

export interface INostrPostEventRepository {
	fetchEvents(relays: RelayModel[]): Promise<Event[]>;
	subscribeEvents(
		relays: RelayModel[],
		onEvent: (event: Event) => void,
	): () => void;
	fetchUserProfiles(pubkeys: string[], relays: RelayModel[]): Promise<Event[]>;
	fetchUserProfile(
		pubkey: string,
		relays: RelayModel[],
	): Promise<Event | undefined>;
	postEvent(event: Event, relays: RelayModel[]): Promise<void>;
}
