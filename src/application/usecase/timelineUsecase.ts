import type { Event } from "nostr-tools/pure";
import type { Relay } from "../../domain/model/nostr";
import { NostrGateway } from "../../infrastructure/nostr/nostrGateway";

export class TimelineUsecase {
	private nostrGateway: NostrGateway;

	constructor(relays: Relay[]) {
		this.nostrGateway = new NostrGateway(relays);
	}

	async fetchTimeline(): Promise<Event[]> {
		return this.nostrGateway.fetchEvents();
	}
}
