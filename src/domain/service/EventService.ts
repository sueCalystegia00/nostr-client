import type { NostrEvent } from "nostr-tools/pure";
import type { TabType } from "../model/ui";

export class EventService {
	filterEventsByTab = (
		events: NostrEvent[],
		tab: TabType,
		readIds: Set<string>,
	): NostrEvent[] => {
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
