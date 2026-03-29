import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import type {
	NostrEvent,
	RelayConfig,
	RelayMarker,
	UnsignedEvent,
} from "../../domain/model/nostr";
import type { ISignerAdapter } from "../../domain/repository/ISignerAdapter";
import { RelayUrl } from "../../domain/valueObject/RelayUrl";

export class Nip07SignerAdapter implements ISignerAdapter {
	private signer: NDKNip07Signer;
	private ndk: NDK;

	constructor(ndk: NDK) {
		this.signer = new NDKNip07Signer();
		this.ndk = ndk;
	}

	async getPublicKey(): Promise<string> {
		const user = await this.signer.user();
		return user.pubkey;
	}

	public async getLocalRelays(): Promise<RelayConfig[]> {
		await this.waitLoadingExtension();

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
		const ndkEvent = new NDKEvent(this.ndk);
		ndkEvent.kind = event.kind;
		ndkEvent.tags = event.tags;
		ndkEvent.content = event.content;
		ndkEvent.created_at = event.created_at;
		ndkEvent.pubkey = await this.getPublicKey();

		await ndkEvent.sign(this.signer);

		return {
			kind: ndkEvent.kind as number,
			tags: ndkEvent.tags,
			content: ndkEvent.content,
			created_at: ndkEvent.created_at as number,
			pubkey: ndkEvent.pubkey,
			id: ndkEvent.id as string,
			sig: ndkEvent.sig as string,
		};
	}

	private async waitLoadingExtension(timeoutMs = 1000): Promise<void> {
		if (typeof window === "undefined") return;
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
