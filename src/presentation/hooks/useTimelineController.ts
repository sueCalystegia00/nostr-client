import { useNDK } from "@nostr-dev-kit/react";
import { useEffect, useMemo, useState } from "react";
import { TimelineUsecase } from "../../application/usecase/timelineUsecase";
import type { NostrPost } from "../../domain/model/nostr";
import { NostrEventService } from "../../domain/service/nostrEventService";
import { NostrRelayService } from "../../domain/service/nostrRelayService";
import { NdkEventRepository } from "../../infrastructure/nostr/ndkEventRepository";
import { NostrRelayRepository } from "../../infrastructure/nostr/nostrRelayRepository";
import { useAuthStore } from "./useAuthStore";

interface TimelineState {
	byId: Record<string, NostrPost>;
	orderedIds: string[];
}

export const useTimelineController = () => {
	// 1. NDKからインスタンスを取得
	const { ndk } = useNDK();
	const { signerAdapter } = useAuthStore();

	const [state, setState] = useState<TimelineState>({
		byId: {},
		orderedIds: [],
	});

	// 2. DIとUsecaseのインスタンス化
	const timelineUsecase = useMemo(() => {
		if (!ndk) return null;
		// リポジトリ
		const ndkEventRepo = new NdkEventRepository(ndk);
		const relayRepo = new NostrRelayRepository();

		// サービス
		const eventService = new NostrEventService(signerAdapter, ndkEventRepo);
		const relayService = new NostrRelayService(signerAdapter, relayRepo);

		// ユースケース生成
		return new TimelineUsecase(eventService, relayService);
	}, [ndk, signerAdapter]);

	useEffect(() => {
		let isMounted = true;
		let unsubscribe: (() => void) | undefined;

		const subscribe = async () => {
			if (!timelineUsecase) return;

			const cleanup = await timelineUsecase.subscribeTimeline((newEvent) => {
				if (!isMounted) return;
				setState((prev) => {
					const isExisting = Boolean(prev.byId[newEvent.id]);
					if (isExisting) {
						return {
							...prev,
							byId: { ...prev.byId, [newEvent.id]: newEvent },
						};
					}

					const newOrderedIds = [...prev.orderedIds];
					let low = 0;
					let high = newOrderedIds.length - 1;

					while (low <= high) {
						const mid = Math.floor(low + (high - low) / 2);
						const midEvent = prev.byId[newOrderedIds[mid]];
						if (midEvent.created_at < newEvent.created_at) {
							high = mid - 1;
						} else {
							low = mid + 1;
						}
					}

					newOrderedIds.splice(low, 0, newEvent.id);

					return {
						byId: { ...prev.byId, [newEvent.id]: newEvent },
						orderedIds: newOrderedIds,
					};
				});
			});

			if (!isMounted) {
				cleanup();
			} else {
				unsubscribe = cleanup;
			}
		};

		subscribe();

		return () => {
			isMounted = false;
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, [timelineUsecase]);

	const timeline = useMemo(() => {
		return state.orderedIds.map((id) => state.byId[id]);
	}, [state]);

	return { timeline };
};
