import { useEffect, useMemo, useState } from "react";
import { TimelineUsecase } from "../../application/usecase/timelineUsecase";
import type { NostrPost } from "../../domain/model/nostr";

export const useTimeline = () => {
	const [timeline, setTimeline] = useState<NostrPost[]>([]);
	const timelineUsecase = useMemo(() => new TimelineUsecase(), []);

	useEffect(() => {
		let isMounted = true;
		let unsubscribe: (() => void) | undefined;

		const subscribe = async () => {
			const cleanup = await timelineUsecase.subscribeTimeline((newEvent) => {
				if (!isMounted) return;
				setTimeline((prev) => {
					const existsIndex = prev.findIndex((e) => e.id === newEvent.id);
					const newTimeline = [...prev];
					if (existsIndex >= 0) {
						// 既存のイベントのプロフィール情報の後追い更新等
						newTimeline[existsIndex] = newEvent;
					} else {
						// 新規イベントは、既に降順（最新が先頭）ソート済の配列に対して適切な位置へ挿入する
						// ストリーミングで流れてくる最新イベントは、通常1番目にマッチするため非常に高速
						const insertIndex = newTimeline.findIndex(
							(e) => e.created_at < newEvent.created_at,
						);
						if (insertIndex === -1) {
							newTimeline.push(newEvent); // 最も古い場合は末尾に追加
						} else {
							newTimeline.splice(insertIndex, 0, newEvent);
						}
					}
					return newTimeline;
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

	return { timeline };
};
