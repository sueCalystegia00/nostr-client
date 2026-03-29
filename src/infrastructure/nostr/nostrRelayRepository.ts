import { SimplePool } from "nostr-tools";
import { RelayList } from "nostr-tools/kinds";
import type { RelayConfig, RelayMarker } from "../../domain/model/nostr";
import type { INostrRelayRepository } from "../../domain/repository/INostrRelayRepository";
import { RelayUrl } from "../../domain/valueObject/RelayUrl";

export class NostrRelayRepository implements INostrRelayRepository {
	private pool: SimplePool;

	constructor() {
		this.pool = new SimplePool();
	}

	public async getNetworkRelays(
		pubkey: string,
		bootstrapRelays: string[],
	): Promise<RelayConfig[]> {
		try {
			const events = await this.pool.querySync(bootstrapRelays, {
				kinds: [RelayList],
				authors: [pubkey],
				limit: 1,
			});

			if (!events || events.length === 0) return [];

			// kind: 10002は置換可能イベントであるため、最新のcreated_atを持つものを特定
			const latestEvent = events.reduce((prev, current) =>
				prev.created_at > current.created_at ? prev : current,
			);

			// 'r'タグを解析して複数リレー設定の配列を構築
			return latestEvent.tags
				.filter((tag: string[]) => tag[0] === "r" && tag[1])
				.map((tag: string[]) => {
					let marker: RelayMarker = "both";
					if (tag[2] === "read") marker = "read";
					if (tag[2] === "write") marker = "write";
					return { url: RelayUrl.create(tag[1]), marker };
				});
		} catch (error) {
			console.error("NIP-65: Failed to fetch network relays.", error);
			return [];
		}
	}
}
