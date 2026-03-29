import { useEffect, useMemo } from "react";
import type { NostrPost } from "../../../domain/model/nostr";
import { useScrollManager } from "../../hooks/useScrollManager";
import type { TabType } from "../../model/ui";
import { TimelinePresenter } from "./TimelinePresenter";

interface Props {
	timeline: NostrPost[];
	currentTab: TabType;
	readPostIds: Set<string>;
	markAsRead: (ids: string[]) => void;
	setToastMessage: (msg: string) => void;
}

export const TimelineContainer = ({
	timeline,
	currentTab,
	readPostIds,
	markAsRead,
	setToastMessage,
}: Props) => {
	const { containerRef, handleScroll, registerItem } = useScrollManager(
		currentTab,
		markAsRead,
	);

	// 初回マウント時にスクロール判定を発火
	useEffect(() => {
		handleScroll();
	}, [handleScroll]);

	const filteredEvents = useMemo(() => {
		switch (currentTab) {
			case "UNREAD":
				return timeline.filter((e) => !readPostIds.has(e.id));
			case "HOME":
				return timeline; // ※実際にはここでホーム（フォロー中）のフィルタリングを行う
			case "LIST":
				return timeline; // ※実際にはここでリスト（特定ユーザー群）のフィルタリングを行う
		}
	}, [timeline, currentTab, readPostIds]);

	return (
		<TimelinePresenter
			filteredEvents={filteredEvents}
			containerRef={containerRef}
			handleScroll={handleScroll}
			setToastMessage={setToastMessage}
			registerItem={registerItem}
		/>
	);
};
