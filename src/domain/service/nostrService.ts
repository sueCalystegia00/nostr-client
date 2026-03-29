import { Nos2xRepository } from "../../infrastructure/nostr/nos2xRepository";
import { NostrGateway } from "../../infrastructure/nostr/nostrGateway";
import type {
	NostrPost,
	Relay,
	UnsignedEvent,
	UserProfile,
} from "../model/nostr";

export class NostrService {
	private nos2xRepository: Nos2xRepository;
	private nostrGateway: NostrGateway;

	constructor(relays: Relay[]) {
		this.nos2xRepository = new Nos2xRepository();
		this.nostrGateway = new NostrGateway(relays);
	}

	async fetchTimeline(): Promise<NostrPost[]> {
		const events = await this.nostrGateway.fetchEvents();
		const pubkeys = [...new Set(events.map((e) => e.pubkey))];
		const profileEvents = await this.nostrGateway.fetchUserProfiles(pubkeys);

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

	async post(content: string): Promise<void> {
		const publicKey = await this.nos2xRepository.getPublicKey();
		const unsignedEvent = this.createUnsignedEvent(publicKey, content);
		const signedEvent = await this.nos2xRepository.signEvent(unsignedEvent);
		await this.nostrGateway.postEvent(signedEvent);
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
