import { NostrEventService } from "../../domain/service/nostrEventService";
import { NostrRelayService } from "../../domain/service/nostrRelayService";

export class PostUsecase {
	private nostrEventService: NostrEventService;
	private nostrRelayService: NostrRelayService;

	constructor() {
		this.nostrEventService = new NostrEventService();
		this.nostrRelayService = new NostrRelayService();
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
