import { NostrService } from "../../domain/service/nostrService";
import { NostrGateway } from "../../infrastructure/nostr/nostrGateway";
import type { Relay } from "../../domain/model/nostr";

export class PostUsecase {
	private nostrService: NostrService;
	private nostrGateway: NostrGateway;

	constructor(relays: Relay[]) {
		this.nostrService = new NostrService();
		this.nostrGateway = new NostrGateway(relays);
	}

	async post(content: string): Promise<void> {
		const publicKey = await this.nostrService.getPublicKey();
		const unsignedEvent = this.nostrService.createUnsignedEvent(
			publicKey,
			content,
		);
		const signedEvent = await this.nostrService.signEvent(unsignedEvent);
		await this.nostrGateway.postEvent(signedEvent);
	}
}
