import type { Relay, NostrPost } from "../../domain/model/nostr";
import { NostrService } from "../../domain/service/nostrService";

export class TimelineUsecase {
	private nostrService: NostrService;

	constructor(relays: Relay[]) {
		this.nostrService = new NostrService(relays);
	}

	async fetchTimeline(): Promise<NostrPost[]> {
		return await this.nostrService.fetchTimeline();
	}
}
