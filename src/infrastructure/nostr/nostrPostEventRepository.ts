import {
	type AbstractPoolConstructorOptions,
	AbstractSimplePool,
} from "nostr-tools/abstract-pool";
import { Metadata, ShortTextNote } from "nostr-tools/kinds";
import type { Event } from "nostr-tools/pure";
import { verifyEvent } from "nostr-tools/wasm";
import type { RelayModel } from "../../domain/model/nostr";

export class NostrPostEventRepository {
	private pool: AbstractSimplePool;

	constructor() {
		this.pool = new AbstractSimplePool({
			verifyEvent: verifyEvent,
			enablePing: true,
			enableReconnect: true,
		} as AbstractPoolConstructorOptions);
	}

	async fetchEvents(relays: RelayModel[]): Promise<Event[]> {
		const relayUrls = relays.map((r) => r.url);
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

	async fetchUserProfiles(
		pubkeys: string[],
		relays: RelayModel[],
	): Promise<Event[]> {
		if (pubkeys.length === 0) {
			return [];
		}
		const relayUrls = relays.map((r) => r.url);
		const events: Event[] = [];

		return new Promise((resolve) => {
			const timeoutId = setTimeout(() => {
				sub.close();
				resolve(this.normalizeEvents(events));
			}, 3000);

			const sub = this.pool.subscribeMany(
				relayUrls,
				{
					authors: pubkeys,
					kinds: [Metadata],
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

	async postEvent(event: Event, relays: RelayModel[]): Promise<void> {
		const relayUrls = relays.map((r) => r.url);

		try {
			await Promise.any(this.pool.publish(relayUrls, event));
		} catch (error) {
			throw new Error(
				"ネットワーク内のいずれのリレーへのイベント送信も失敗しました。",
				{ cause: error },
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
