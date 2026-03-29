import type { RelayConfig } from "../model/nostr";
import type { ISignerAdapter } from "../repository/ISignerAdapter";
import type { INostrRelayRepository } from "../repository/INostrRelayRepository";
import { RelayUrl } from "../valueObject/RelayUrl";

export class NostrRelayService {
	// ブートストラップ（初期探索）用の複数インデクサーリレー
	private readonly BOOTSTRAP_RELAYS: string[] = [
		"wss://relay-jp.nostr.wirednet.jp",
		"wss://relay.nostr.wirednet.jp",
		"wss://r.kojira.io",
	];

	private static globalCachedRelays: RelayConfig[] | null = null;

	public static clearCache(): void {
		NostrRelayService.globalCachedRelays = null;
	}

	private signerAdapter: ISignerAdapter | null;
	private nostrRelayRepository: INostrRelayRepository;

	constructor(
		signerAdapter: ISignerAdapter | null,
		nostrRelayRepository: INostrRelayRepository,
	) {
		this.signerAdapter = signerAdapter;
		this.nostrRelayRepository = nostrRelayRepository;
	}

	public async resolveCurrentUserRelays(): Promise<RelayConfig[]> {
		if (NostrRelayService.globalCachedRelays) {
			return NostrRelayService.globalCachedRelays;
		}

		if (!this.signerAdapter) {
			const defaultRelays = this.getDefaultRelays();
			NostrRelayService.globalCachedRelays = defaultRelays;
			return defaultRelays;
		}

		// 1. カレントユーザーの場合は、まずローカルのNIP-07プロバイダから複数リレーの設定を取得
		const localRelays = await this.signerAdapter.getLocalRelays();
		if (localRelays && localRelays.length > 0) {
			NostrRelayService.globalCachedRelays = localRelays;
			return localRelays;
		}

		const usersPubkey = await this.signerAdapter.getPublicKey();
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
