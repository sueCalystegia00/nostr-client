import { SimplePool } from "nostr-tools/pool";
import type { Event } from "nostr-tools/pure";
import { ShortTextNote } from "nostr-tools/kinds";
import type { Relay as RelayModel } from "../../domain/model/relay";

export class NostrGateway {
	private pool: SimplePool;
	private relays: RelayModel[];

	constructor(relays: RelayModel[]) {
		this.relays = relays;

		this.pool = new SimplePool({
			enablePing: true,
			enableReconnect: true,
		});
	}

	async fetchEvents(): Promise<Event[]> {
		const relayUrls = this.relays.map((r) => r.url);
		const events: Event[] = [];

		return new Promise((resolve) => {
			const timeoutId = setTimeout(() => {
				sub.close();
				resolve(this.normalizeEvents(events));
			}, 8000);

			const sub = this.pool.subscribeMany(
				relayUrls,
				{
					authors: undefined,
					kinds: [ShortTextNote],
				},
				{
					onevent: (event: Event) => {
						events.push(event);
					},
					oneose: () => {
						clearTimeout(timeoutId);
						sub.close();
						resolve(this.normalizeEvents(events));
					},
				},
			);
		});
	}

	async postEvent(event: Event): Promise<void> {
		const relayUrls = this.relays.map((r) => r.url);

		try {
			await Promise.any(this.pool.publish(relayUrls, event));
		} catch (error) {
			throw new Error(
				"ネットワーク内のいずれのリレーへのイベント送信も失敗しました。",
			);
		}
	}

	private normalizeEvents(rawEvents: Event[]): Event[] {
		const uniqueEvents = Array.from(
			new Map(rawEvents.map((e) => [e.id, e])).values(),
		);

		return uniqueEvents.sort((a, b) => b.created_at - a.created_at);
	}
}
