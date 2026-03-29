import type { NostrEvent, UnsignedEvent } from "nostr-tools/pure";
import type { RelayConfig, RelayMarker } from "../../domain/model/nostr";
import { RelayUrl } from "../../domain/valueObject/RelayUrl";

export class Nos2xRepository {
	async getPublicKey(): Promise<string> {
		await this.waitLoadingNos2xExtension();
		if (window.nostr) {
			return await window.nostr.getPublicKey();
		}
		throw new Error("nos2x is not installed.");
	}

	public async getLocalRelays(): Promise<RelayConfig[]> {
		await this.waitLoadingNos2xExtension();

		if (!window.nostr?.getRelays) {
			return [];
		}

		try {
			const extensionRelays = await window.nostr.getRelays();
			if (!extensionRelays) return [];

			const parsedRelays: RelayConfig[] = Object.entries(extensionRelays).map(
				([url, config]: [string, { read: boolean; write: boolean }]) => {
					let marker: RelayMarker = "both";
					if (config.read && !config.write) marker = "read";
					if (!config.read && config.write) marker = "write";

					return { url: RelayUrl.create(url), marker };
				},
			);
			return parsedRelays;
		} catch (error) {
			console.error("NIP-07: Failed to fetch relays from extension.", error);
			return [];
		}
	}

	async signEvent(event: UnsignedEvent): Promise<NostrEvent> {
		await this.waitLoadingNos2xExtension();
		if (window.nostr) {
			return await window.nostr.signEvent(event);
		}
		throw new Error("nos2x is not installed.");
	}

	private async waitLoadingNos2xExtension(timeoutMs = 1000): Promise<void> {
		if (window.nostr) return;
		return new Promise((resolve) => {
			const interval = setInterval(() => {
				if (window.nostr) {
					clearInterval(interval);
					resolve();
				}
			}, 100);
			setTimeout(() => {
				clearInterval(interval);
				resolve();
			}, timeoutMs);
		});
	}
}
