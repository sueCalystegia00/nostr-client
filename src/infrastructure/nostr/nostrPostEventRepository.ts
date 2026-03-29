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

	subscribeEvents(
		relays: RelayModel[],
		onEvent: (event: Event) => void,
	): () => void {
		const relayUrls = relays.map((r) => r.url);

		const sub = this.pool.subscribeMany(
			relayUrls,
			{
				authors: undefined,
				kinds: [ShortTextNote],
			},
			{
				onevent: (event: Event) => {
					onEvent(event);
				},
			},
		);

		return () => {
			sub.close();
		};
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

	async fetchUserProfile(
		pubkey: string,
		relays: RelayModel[],
	): Promise<Event | undefined> {
		const relayUrls = relays.map((r) => r.url);

		return new Promise((resolve) => {
			let resolved = false;
			const timeoutId = setTimeout(() => {
				if (!resolved) {
					resolved = true;
					sub.close();
					resolve(undefined);
				}
			}, 3000);

			const sub = this.pool.subscribeMany(
				relayUrls,
				{
					authors: [pubkey],
					kinds: [Metadata],
				},
				{
					onevent: (event: Event) => {
						if (!resolved) {
							resolved = true;
							clearTimeout(timeoutId);
							sub.close();
							resolve(event);
						}
					},
					oneose: () => {
						if (!resolved) {
							resolved = true;
							clearTimeout(timeoutId);
							sub.close();
							resolve(undefined);
						}
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
