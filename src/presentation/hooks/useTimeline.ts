import { useState, useEffect } from "react";
import { TimelineUsecase } from "../../application/usecase/timelineUsecase";
import type { NostrPost, Relay } from "../../domain/model/nostr";

const relays: Relay[] = [{ url: "wss://relay-jp.nostr.wirednet.jp" }];

export const useTimeline = () => {
	const [timeline, setTimeline] = useState<NostrPost[]>([]);
	const timelineUsecase = new TimelineUsecase(relays);

	useEffect(() => {
		const fetchTimeline = async () => {
			const events = await timelineUsecase.fetchTimeline();
			setTimeline(events);
		};
		fetchTimeline();
	}, []);

	return { timeline };
};
