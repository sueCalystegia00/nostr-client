import type {
	Relay,
	EnrichedEvent,
	UserProfile,
} from "../../domain/model/nostr";
import { NostrGateway } from "../../infrastructure/nostr/nostrGateway";

export class TimelineUsecase {
	private nostrGateway: NostrGateway;

	constructor(relays: Relay[]) {
		this.nostrGateway = new NostrGateway(relays);
	}

	async fetchTimeline(): Promise<EnrichedEvent[]> {
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
}
