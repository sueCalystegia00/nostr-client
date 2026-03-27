import { useState, useEffect } from "react";
import type { Event } from "nostr-tools/pure";
import { TimelineUsecase } from "../../application/usecase/timelineUsecase";
import type { Relay } from "../../domain/model/relay";

const relays: Relay[] = [{ url: "wss://relay-jp.nostr.wirednet.jp" }];

export const useTimeline = () => {
	const [timeline, setTimeline] = useState<Event[]>([]);
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
