import type { Event as NostrEvent, UnsignedEvent } from "nostr-tools/pure";

export class NostrService {
	async getPublicKey(): Promise<string> {
		if (window.nostr) {
			return await window.nostr.getPublicKey();
		}
		throw new Error("nos2x is not installed.");
	}

	createUnsignedEvent(publicKey: string, content: string): UnsignedEvent {
		return {
			kind: 1,
			created_at: Math.floor(Date.now() / 1000),
			tags: [],
			content: content,
			pubkey: publicKey,
		};
	}

	async signEvent(event: UnsignedEvent): Promise<NostrEvent> {
		if (window.nostr) {
			return await window.nostr.signEvent(event);
		}
		throw new Error("nos2x is not installed.");
	}
}
