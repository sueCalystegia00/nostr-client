import { Nos2xRepository } from "../../infrastructure/nostr/nos2xRepository";
import { NostrPostEventRepository } from "../../infrastructure/nostr/nostrPostEventRepository";
import type {
	NostrPost,
	RelayConfig,
	RelayMarker,
	RelayModel,
	UnsignedEvent,
	UserProfile,
} from "../model/nostr";

export class NostrEventService {
	private nos2xRepository: Nos2xRepository;
	private nostrPostEventRepository: NostrPostEventRepository;

	constructor() {
		this.nos2xRepository = new Nos2xRepository();
		this.nostrPostEventRepository = new NostrPostEventRepository();
	}

	async fetchTimeline(relays: RelayConfig[]): Promise<NostrPost[]> {
		const relaysModels = this.getRelaysToUse(relays, "read");
		const events =
			await this.nostrPostEventRepository.fetchEvents(relaysModels);

		const pubkeys = [...new Set(events.map((e) => e.pubkey))];
		const profileEvents = await this.nostrPostEventRepository.fetchUserProfiles(
			pubkeys,
			relaysModels,
		);

		const profiles = new Map<string, UserProfile>();
		for (const profileEvent of profileEvents) {
			try {
				const profile = JSON.parse(profileEvent.content) as UserProfile;
				profile.pubkey = profileEvent.pubkey;
				profiles.set(profileEvent.pubkey, profile);
			} catch (e) {
				console.error("failed to parse profile", e);
			}
		}

		return events.map((event) => {
			return {
				...event,
				profile: profiles.get(event.pubkey),
			};
		});
	}

	subscribeTimeline(
		relays: RelayConfig[],
		onEvent: (post: NostrPost) => void,
	): () => void {
		const relaysModels = this.getRelaysToUse(relays, "read");
		const profiles = new Map<string, UserProfile>();
		const fetchingProfiles = new Set<string>();

		const unsubscribe = this.nostrPostEventRepository.subscribeEvents(
			relaysModels,
			(event) => {
				const profile = profiles.get(event.pubkey);
				const post: NostrPost = {
					...event,
					profile,
				};
				// まずは即時通知（プロフィール情報なしの場合はなしのまま）
				onEvent(post);

				// プロフィール情報がなく、現在取得中でない場合は取得をリクエスト
				if (!profile && !fetchingProfiles.has(event.pubkey)) {
					fetchingProfiles.add(event.pubkey);
					this.nostrPostEventRepository
						.fetchUserProfile(event.pubkey, relaysModels)
						.then((profileEvent) => {
							if (profileEvent) {
								try {
									const parsedProfile = JSON.parse(
										profileEvent.content,
									) as UserProfile;
									parsedProfile.pubkey = profileEvent.pubkey;
									profiles.set(event.pubkey, parsedProfile);

									// プロフィールが取得できたら後追いで再通知して更新を促す
									onEvent({
										...event,
										profile: parsedProfile,
									});
								} catch (e) {
									console.error("failed to parse profile", e);
								}
							}
						})
				}
			},
		);

		return unsubscribe;
	}

	async post(content: string, relays: RelayConfig[]): Promise<void> {
		const publicKey = await this.nos2xRepository.getPublicKey();
		const unsignedEvent = this.createUnsignedEvent(publicKey, content);
		const signedEvent = await this.nos2xRepository.signEvent(unsignedEvent);

		const relaysModels = this.getRelaysToUse(relays, "write");
		await this.nostrPostEventRepository.postEvent(signedEvent, relaysModels);
	}

	async react(
		targetEventId: string,
		targetPubkey: string,
		relays: RelayConfig[],
	): Promise<void> {
		const publicKey = await this.nos2xRepository.getPublicKey();
		const unsignedEvent = this.createUnsignedReactionEvent(
			publicKey,
			targetEventId,
			targetPubkey,
		);
		const signedEvent = await this.nos2xRepository.signEvent(unsignedEvent);

		const relaysModels = this.getRelaysToUse(relays, "write");
		await this.nostrPostEventRepository.postEvent(signedEvent, relaysModels);
	}

	private getRelaysToUse(
		relays: RelayConfig[],
		marker: RelayMarker,
	): RelayModel[] {
		return relays
			.filter((r) => r.marker === marker || r.marker === "both")
			.map((r) => ({ url: r.url.value }));
	}

	private createUnsignedEvent(
		publicKey: string,
		content: string,
	): UnsignedEvent {
		return {
			kind: 1,
			created_at: Math.floor(Date.now() / 1000),
			tags: [],
			content: content,
			pubkey: publicKey,
		};
	}

	private createUnsignedReactionEvent(
		publicKey: string,
		targetEventId: string,
		targetPubkey: string,
	): UnsignedEvent {
		return {
			kind: 7,
			created_at: Math.floor(Date.now() / 1000),
			tags: [
				["e", targetEventId],
				["p", targetPubkey],
			],
			content: "+",
			pubkey: publicKey,
		};
	}
}
