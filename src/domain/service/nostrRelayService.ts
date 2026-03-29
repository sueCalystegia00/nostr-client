import { Nos2xRepository } from "../../infrastructure/nostr/nos2xRepository";
import { NostrRelayRepository } from "../../infrastructure/nostr/nostrRelayRepository";
import type { RelayConfig } from "../model/nostr";
import { RelayUrl } from "../valueObject/RelayUrl";

export class NostrRelayService {
	// ブートストラップ（初期探索）用の複数インデクサーリレー
	private readonly BOOTSTRAP_RELAYS: string[] = [
		"wss://purplepag.es",
		"wss://relay.damus.io",
		"wss://relay.nostr.band",
	];

	private nos2xRepository: Nos2xRepository;
	private nostrRelayRepository: NostrRelayRepository;

	constructor() {
		this.nos2xRepository = new Nos2xRepository();
		this.nostrRelayRepository = new NostrRelayRepository();
	}

	public async resolveCurrentUserRelays(): Promise<RelayConfig[]> {
		// 1. カレントユーザーの場合は、まずローカルのNIP-07プロバイダから複数リレーの設定を取得
		const localRelays = await this.nos2xRepository.getLocalRelays();
		if (localRelays && localRelays.length > 0) {
			return localRelays;
		}

		const usersPubkey = await this.nos2xRepository.getPublicKey();
		// 2. ローカルに複数リレーの設定がない場合は、公開鍵を用いてネットワーク検索
		return await this.resolveUserRelays(usersPubkey);
	}

	private async resolveUserRelays(pubkey: string): Promise<RelayConfig[]> {
		let resolvedRelays: RelayConfig[] = [];

		// 公開鍵を用いてネットワーク検索
		if (resolvedRelays.length === 0) {
			const networkRelays = await this.nostrRelayRepository.getNetworkRelays(
				pubkey,
				this.BOOTSTRAP_RELAYS,
			);
			if (networkRelays && networkRelays.length > 0) {
				resolvedRelays = networkRelays;
			}
		}

		// どの手法でも取得できなかった場合の最終フォールバック
		if (resolvedRelays.length === 0) {
			resolvedRelays = this.getDefaultRelays();
		}
		return resolvedRelays;
	}

	private getDefaultRelays(): RelayConfig[] {
		return this.BOOTSTRAP_RELAYS.map((url) => ({
			url: RelayUrl.create(url),
			marker: "both",
		}));
	}
}
