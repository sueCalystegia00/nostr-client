import type { NostrPost } from "../../domain/model/nostr";
import type { NostrEventService } from "../../domain/service/nostrEventService";
import type { NostrRelayService } from "../../domain/service/nostrRelayService";

export class TimelineUsecase {
	private nostrEventService: NostrEventService;
	private nostrRelayService: NostrRelayService;

	constructor(
		nostrEventService: NostrEventService,
		nostrRelayService: NostrRelayService,
	) {
		this.nostrEventService = nostrEventService;
		this.nostrRelayService = nostrRelayService;
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
