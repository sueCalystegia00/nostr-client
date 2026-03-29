import { NostrService } from "../../domain/service/nostrService";
import type { Relay } from "../../domain/model/nostr";

export class PostUsecase {
	private nostrService: NostrService;

	constructor(relays: Relay[]) {
		this.nostrService = new NostrService(relays);
	}

	async post(content: string): Promise<void> {
		return await this.nostrService.post(content);
	}
}
