import type { NostrEventService } from "../../domain/service/nostrEventService";
import type { NostrRelayService } from "../../domain/service/nostrRelayService";

export class PostUsecase {
	private nostrEventService: NostrEventService;
	private nostrRelayService: NostrRelayService;

	constructor(
		nostrEventService: NostrEventService,
		nostrRelayService: NostrRelayService,
	) {
		this.nostrEventService = nostrEventService;
		this.nostrRelayService = nostrRelayService;
	}

	async post(content: string): Promise<void> {
		const relays = await this.nostrRelayService.resolveCurrentUserRelays();
		return await this.nostrEventService.post(content, relays);
	}

	async react(targetEventId: string, targetPubkey: string): Promise<void> {
		const relays = await this.nostrRelayService.resolveCurrentUserRelays();
		return await this.nostrEventService.react(
			targetEventId,
			targetPubkey,
			relays,
		);
	}
}
