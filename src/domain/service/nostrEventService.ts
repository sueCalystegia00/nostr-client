import { Nos2xRepository } from "../../infrastructure/nostr/nos2xRepository";
import { NostrPostEventRepository } from "../../infrastructure/nostr/nostrPostEventRepository";
import type {
	NostrPost,
	RelayConfig,
	RelayMarker,
	RelayModel,
	UnsignedEvent,
	UserProfile,
} from "../model/nostr";

export class NostrEventService {
	private nos2xRepository: Nos2xRepository;
	private nostrPostEventRepository: NostrPostEventRepository;

	constructor() {
		this.nos2xRepository = new Nos2xRepository();
		this.nostrPostEventRepository = new NostrPostEventRepository();
	}

	async fetchTimeline(relays: RelayConfig[]): Promise<NostrPost[]> {
		const relaysModels = this.getRelaysToUse(relays, "read");
		const events =
			await this.nostrPostEventRepository.fetchEvents(relaysModels);

		const pubkeys = [...new Set(events.map((e) => e.pubkey))];
		const profileEvents = await this.nostrPostEventRepository.fetchUserProfiles(
			pubkeys,
			relaysModels,
		);

		const profiles = new Map<string, UserProfile>();
		for (const profileEvent of profileEvents) {
			try {
				const profile = JSON.parse(profileEvent.content) as UserProfile;
				profile.pubkey = profileEvent.pubkey;
				profiles.set(profileEvent.pubkey, profile);
			} catch (e) {
				console.error("failed to parse profile", e);
			}
		}

		return events.map((event) => {
			return {
				...event,
				profile: profiles.get(event.pubkey),
			};
		});
	}

	async post(content: string, relays: RelayConfig[]): Promise<void> {
		const publicKey = await this.nos2xRepository.getPublicKey();
		const unsignedEvent = this.createUnsignedEvent(publicKey, content);
		const signedEvent = await this.nos2xRepository.signEvent(unsignedEvent);

		const relaysModels = this.getRelaysToUse(relays, "write");
		await this.nostrPostEventRepository.postEvent(signedEvent, relaysModels);
	}

	private getRelaysToUse(
		relays: RelayConfig[],
		marker: RelayMarker,
	): RelayModel[] {
		return relays
			.filter((r) => r.marker === marker || r.marker === "both")
			.map((r) => ({ url: r.url.value }));
	}

	private createUnsignedEvent(
		publicKey: string,
		content: string,
	): UnsignedEvent {
		return {
			kind: 1,
			created_at: Math.floor(Date.now() / 1000),
			tags: [],
			content: content,
			pubkey: publicKey,
		};
	}
}
