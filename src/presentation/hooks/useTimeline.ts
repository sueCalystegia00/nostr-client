import { useEffect, useState } from "react";
import { TimelineUsecase } from "../../application/usecase/timelineUsecase";
import type { NostrPost } from "../../domain/model/nostr";

export const useTimeline = () => {
	const [timeline, setTimeline] = useState<NostrPost[]>([]);
	const timelineUsecase = new TimelineUsecase();

	useEffect(() => {
		const fetchTimeline = async () => {
			const events = await timelineUsecase.fetchTimeline();
			setTimeline(events);
		};
		fetchTimeline();
	}, [timelineUsecase.fetchTimeline]);

	return { timeline };
};
