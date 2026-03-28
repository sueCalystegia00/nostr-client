import { useCallback, useMemo, useState } from "react";

/** 既読状態を管理するフック */
export const useReadReceipts = (totalEventsCount: number) => {
	const [readPostIds, setReadPostIds] = useState<Set<string>>(new Set());

	const markAsRead = useCallback((ids: string[]) => {
		setReadPostIds((prev) => {
			const newSet = new Set(prev);
			let changed = false;
			ids.forEach((id) => {
				if (!newSet.has(id)) {
					newSet.add(id);
					changed = true;
				}
			});
			return changed ? newSet : prev;
		});
	}, []);

	const unreadCount = useMemo(
		() => totalEventsCount - readPostIds.size,
		[totalEventsCount, readPostIds.size],
	);

	return { readPostIds, markAsRead, unreadCount };
};
