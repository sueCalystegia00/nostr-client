import type { NostrEvent, UnsignedEvent } from "nostr-tools/pure";

export class Nos2xRepository {
	async getPublicKey(): Promise<string> {
		if (window.nostr) {
			return await window.nostr.getPublicKey();
		}
		throw new Error("nos2x is not installed.");
	}

	async signEvent(event: UnsignedEvent): Promise<NostrEvent> {
		if (window.nostr) {
			return await window.nostr.signEvent(event);
		}
		throw new Error("nos2x is not installed.");
	}
}
