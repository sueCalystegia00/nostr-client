import type { NostrPost } from "../../domain/model/nostr";
import { NostrEventService } from "../../domain/service/nostrEventService";
import { NostrRelayService } from "../../domain/service/nostrRelayService";

export class TimelineUsecase {
	private nostrEventService: NostrEventService;
	private nostrRelayService: NostrRelayService;

	constructor() {
		this.nostrEventService = new NostrEventService();
		this.nostrRelayService = new NostrRelayService();
	}

	async fetchTimeline(): Promise<NostrPost[]> {
		const relays = await this.nostrRelayService.resolveCurrentUserRelays();
		return await this.nostrEventService.fetchTimeline(relays);
	}

	async subscribeTimeline(
		onEvent: (post: NostrPost) => void,
	): Promise<() => void> {
		const relays = await this.nostrRelayService.resolveCurrentUserRelays();
		return this.nostrEventService.subscribeTimeline(relays, onEvent);
	}
}
