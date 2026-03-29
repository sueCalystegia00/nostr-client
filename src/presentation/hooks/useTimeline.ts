import { useEffect, useMemo, useState } from "react";
import type { NostrPost } from "../../domain/model/nostr";
import { useDI } from "../context/diContext";

interface TimelineState {
	byId: Record<string, NostrPost>;
	orderedIds: string[];
}

export const useTimeline = () => {
	const [state, setState] = useState<TimelineState>({
		byId: {},
		orderedIds: [],
	});
	const { timelineUsecase } = useDI();

	useEffect(() => {
		let isMounted = true;
		let unsubscribe: (() => void) | undefined;

		const subscribe = async () => {
			const cleanup = await timelineUsecase.subscribeTimeline((newEvent) => {
				if (!isMounted) return;
				setState((prev) => {
					const isExisting = Boolean(prev.byId[newEvent.id]);
					if (isExisting) {
						// 既存のイベントのプロフィール情報の後追い更新等: O(1)
						return {
							...prev,
							byId: { ...prev.byId, [newEvent.id]: newEvent },
						};
					}

					// 新規イベントは、既に降順（最新が先頭）ソート済のリストに対して適切な位置へ挿入する
					// ストリーミングで流れてくる最新イベントは二分探索で高速に挿入位置（通常は先頭位置0）に決定される
					const newOrderedIds = [...prev.orderedIds];
					let low = 0;
					let high = newOrderedIds.length - 1;

					while (low <= high) {
						const mid = Math.floor(low + (high - low) / 2);
						const midEvent = prev.byId[newOrderedIds[mid]];
						// 降順ソート
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
