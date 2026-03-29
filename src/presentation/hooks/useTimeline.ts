import { useEffect, useMemo, useState } from "react";
import { TimelineUsecase } from "../../application/usecase/timelineUsecase";
import type { NostrPost } from "../../domain/model/nostr";

export const useTimeline = () => {
	const [timeline, setTimeline] = useState<NostrPost[]>([]);
	const timelineUsecase = useMemo(() => new TimelineUsecase(), []);

	useEffect(() => {
		let unsubscribe: (() => void) | undefined;

		const subscribe = async () => {
			unsubscribe = await timelineUsecase.subscribeTimeline((newEvent) => {
				setTimeline((prev) => {
					const existsIndex = prev.findIndex((e) => e.id === newEvent.id);
					const newTimeline = [...prev];
					if (existsIndex >= 0) {
						newTimeline[existsIndex] = newEvent;
					} else {
						newTimeline.push(newEvent);
					}
					return newTimeline.sort((a, b) => b.created_at - a.created_at);
				});
			});
		};

		subscribe();

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, [timelineUsecase]);

	return { timeline };
};
