import type { EnrichedEvent } from "../model/nostr";
import type { TabType } from "../model/ui";

export class EventService {
	filterEventsByTab = (
		events: EnrichedEvent[],
		tab: TabType,
		readIds: Set<string>,
	): EnrichedEvent[] => {
		switch (tab) {
			case "unread":
				return events.filter((e) => !readIds.has(e.id));
			case "home":
			case "list":
			default:
				// ※実際にはここでホーム（フォロー中）やリスト（特定ユーザー群）のフィルタリングを行う
				return events;
		}
	};
}
