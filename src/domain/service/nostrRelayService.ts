import type { RelayConfig } from "../model/nostr";
import type { INos2xRepository } from "../repository/INos2xRepository";
import type { INostrRelayRepository } from "../repository/INostrRelayRepository";
import { RelayUrl } from "../valueObject/RelayUrl";

export class NostrRelayService {
	// ブートストラップ（初期探索）用の複数インデクサーリレー
	private readonly BOOTSTRAP_RELAYS: string[] = [
		"wss://purplepag.es",
		"wss://relay.damus.io",
		"wss://relay.nostr.band",
	];

	private static globalCachedRelays: RelayConfig[] | null = null;

	public static clearCache(): void {
		NostrRelayService.globalCachedRelays = null;
	}

	private nos2xRepository: INos2xRepository;
	private nostrRelayRepository: INostrRelayRepository;

	constructor(
		nos2xRepository: INos2xRepository,
		nostrRelayRepository: INostrRelayRepository,
	) {
		this.nos2xRepository = nos2xRepository;
		this.nostrRelayRepository = nostrRelayRepository;
	}

	public async resolveCurrentUserRelays(): Promise<RelayConfig[]> {
		if (NostrRelayService.globalCachedRelays) {
			return NostrRelayService.globalCachedRelays;
		}

		// 1. カレントユーザーの場合は、まずローカルのNIP-07プロバイダから複数リレーの設定を取得
		const localRelays = await this.nos2xRepository.getLocalRelays();
		if (localRelays && localRelays.length > 0) {
			NostrRelayService.globalCachedRelays = localRelays;
			return localRelays;
		}

		const usersPubkey = await this.nos2xRepository.getPublicKey();
		// 2. ローカルに複数リレーの設定がない場合は、公開鍵を用いてネットワーク検索
		const relays = await this.resolveUserRelays(usersPubkey);
		NostrRelayService.globalCachedRelays = relays;
		return relays;
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
