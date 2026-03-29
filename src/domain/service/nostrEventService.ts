import type {
	NostrPost,
	RelayConfig,
	RelayMarker,
	RelayModel,
	UnsignedEvent,
	UserProfile,
} from "../model/nostr";
import type { ISignerAdapter } from "../repository/ISignerAdapter";
import type { INostrPostEventRepository } from "../repository/INostrPostEventRepository";

export class NostrEventService {
	private signerAdapter: ISignerAdapter | null;
	private nostrPostEventRepository: INostrPostEventRepository;

	constructor(
		signerAdapter: ISignerAdapter | null,
		nostrPostEventRepository: INostrPostEventRepository,
	) {
		this.signerAdapter = signerAdapter;
		this.nostrPostEventRepository = nostrPostEventRepository;
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

		const pendingPubkeys = new Set<string>();
		let batchTimeoutId: ReturnType<typeof setTimeout> | null = null;
		const pendingEventsForProfile = new Map<string, NostrPost[]>();

		const unsubscribeEvents = this.nostrPostEventRepository.subscribeEvents(
			relaysModels,
			(event) => {
				const profile = profiles.get(event.pubkey);
				const post: NostrPost = {
					...event,
					profile,
				};
				// まずは即時通知（プロフィール情報なしの場合はなしのまま）
				onEvent(post);

				// プロフィール情報がない場合は取得をリクエスト
				if (!profile) {
					if (!fetchingProfiles.has(event.pubkey)) {
						fetchingProfiles.add(event.pubkey);
						pendingPubkeys.add(event.pubkey);
					}

					// あとでプロフィール取得完了時に再通知できるよう、イベントを保持
					const userEvents = pendingEventsForProfile.get(event.pubkey) || [];
					userEvents.push(post);
					pendingEventsForProfile.set(event.pubkey, userEvents);

					if (pendingPubkeys.size > 0 && !batchTimeoutId) {
						batchTimeoutId = setTimeout(() => {
							const pubkeysToFetch = Array.from(pendingPubkeys);
							pendingPubkeys.clear();
							batchTimeoutId = null;

							this.nostrPostEventRepository
								.fetchUserProfiles(pubkeysToFetch, relaysModels)
								.then((profileEvents) => {
									for (const profileEvent of profileEvents) {
										try {
											const parsedProfile = JSON.parse(
												profileEvent.content,
											) as UserProfile;
											parsedProfile.pubkey = profileEvent.pubkey;
											profiles.set(profileEvent.pubkey, parsedProfile);
										} catch (e) {
											console.error("failed to parse profile", e);
										}
									}

									// 対象のpubkeyごとに再通知処理
									for (const pubkey of pubkeysToFetch) {
										const parsedProfile = profiles.get(pubkey);
										if (parsedProfile) {
											const userEventsToNotify =
												pendingEventsForProfile.get(pubkey) || [];
											for (const e of userEventsToNotify) {
												onEvent({
													...e,
													profile: parsedProfile,
												});
											}
										}
										// 完了したpubkeyのイベントキャッシュを解放
										pendingEventsForProfile.delete(pubkey);
									}
								});
						}, 500); // 500msのバッチウィンドウ
					}
				}
			},
		);

		return () => {
			if (batchTimeoutId) {
				clearTimeout(batchTimeoutId);
			}
			unsubscribeEvents();
		};
	}

	async post(content: string, relays: RelayConfig[]): Promise<void> {
		if (!this.signerAdapter) {
			throw new Error("Cannot post: User is not authenticated.");
		}
		const publicKey = await this.signerAdapter.getPublicKey();
		const unsignedEvent = this.createUnsignedEvent(publicKey, content);
		const signedEvent = await this.signerAdapter.signEvent(unsignedEvent);

		const relaysModels = this.getRelaysToUse(relays, "write");
		await this.nostrPostEventRepository.postEvent(signedEvent, relaysModels);
	}

	async react(
		targetEventId: string,
		targetPubkey: string,
		relays: RelayConfig[],
	): Promise<void> {
		if (!this.signerAdapter) {
			throw new Error("Cannot react: User is not authenticated.");
		}
		const publicKey = await this.signerAdapter.getPublicKey();
		const unsignedEvent = this.createUnsignedReactionEvent(
			publicKey,
			targetEventId,
			targetPubkey,
		);
		const signedEvent = await this.signerAdapter.signEvent(unsignedEvent);

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
