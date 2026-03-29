import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent, NDKRelaySet } from "@nostr-dev-kit/ndk";
import type { NostrEvent, RelayModel } from "../../domain/model/nostr";
import type { INostrPostEventRepository } from "../../domain/repository/INostrPostEventRepository";

export class NdkEventRepository implements INostrPostEventRepository {
	private ndk: NDK;

	constructor(ndk: NDK) {
		this.ndk = ndk;
	}

	private toNostrEvent(ndkEvent: NDKEvent): NostrEvent {
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

	private fromNostrEvent(event: NostrEvent): NDKEvent {
		const ndkEvent = new NDKEvent(this.ndk);
		ndkEvent.kind = event.kind;
		ndkEvent.tags = event.tags;
		ndkEvent.content = event.content;
		ndkEvent.created_at = event.created_at;
		ndkEvent.pubkey = event.pubkey;
		ndkEvent.id = event.id;
		ndkEvent.sig = event.sig;
		return ndkEvent;
	}

	private getRelaySet(relays: RelayModel[]): NDKRelaySet | undefined {
		if (!relays || relays.length === 0) return undefined;
		const relayUrls = relays.map((r) => r.url);
		return NDKRelaySet.fromRelayUrls(relayUrls, this.ndk);
	}

	async fetchEvents(relays: RelayModel[]): Promise<NostrEvent[]> {
		const filter = { kinds: [1], limit: 100 };
		const events = await this.ndk.fetchEvents(
			filter,
			{ closeOnEose: true },
			this.getRelaySet(relays),
		);
		return Array.from(events)
			.map((e) => this.toNostrEvent(e))
			.sort((a, b) => b.created_at - a.created_at);
	}

	subscribeEvents(
		relays: RelayModel[],
		onEvent: (event: NostrEvent) => void,
	): () => void {
		const filter = { kinds: [1], limit: 100 };
		const sub = this.ndk.subscribe(
			filter,
			{
				closeOnEose: false,
				relaySet: this.getRelaySet(relays)
			}
		);

		sub.on("event", (event: NDKEvent) => {
			onEvent(this.toNostrEvent(event));
		});

		return () => {
			sub.stop();
		};
	}

	async fetchUserProfiles(
		pubkeys: string[],
		relays: RelayModel[],
	): Promise<NostrEvent[]> {
		if (pubkeys.length === 0) return [];

		const filter = { kinds: [0], authors: pubkeys };
		const events = await this.ndk.fetchEvents(
			filter,
			{ closeOnEose: true },
			this.getRelaySet(relays),
		);
		return Array.from(events).map((e) => this.toNostrEvent(e));
	}

	async fetchUserProfile(
		pubkey: string,
		relays: RelayModel[],
	): Promise<NostrEvent | undefined> {
		const filter = { kinds: [0], authors: [pubkey] };
		const event = await this.ndk.fetchEvent(
			filter,
			{ closeOnEose: true },
			this.getRelaySet(relays),
		);
		return event ? this.toNostrEvent(event) : undefined;
	}

	async postEvent(event: NostrEvent, relays: RelayModel[]): Promise<void> {
		const ndkEvent = this.fromNostrEvent(event);
		try {
			// NDK's publish method returns a Set of internal promises connecting to the relay set
			await ndkEvent.publish(this.getRelaySet(relays));
		} catch (error) {
			throw new Error(
				"ネットワーク内のいずれのリレーへのイベント送信も失敗しました。",
				{ cause: error },
			);
		}
	}
}
