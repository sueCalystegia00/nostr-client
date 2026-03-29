import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { TabType } from "../../domain/model/ui";

/** スクロール監視と位置の復元を管理するフック */
export const useScrollManager = (
	currentTab: TabType,
	onReadDetected: (ids: string[]) => void,
) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const itemsRef = useRef<Map<string, HTMLElement>>(new Map()); // 各投稿要素のRefを保持するMap

	const [lastViewedIds, setLastViewedIds] = useState<
		Record<TabType, string | null>
	>({
		unread: null,
		home: null,
		list: null,
	});

	// 要素の参照を登録/解除するコールバック
	const registerItem = useCallback((id: string, el: HTMLElement | null) => {
		if (el) {
			itemsRef.current.set(id, el);
		} else {
			itemsRef.current.delete(id);
		}
	}, []);

	const handleScroll = useCallback(() => {
		if (!containerRef.current) return;
		const container = containerRef.current;
		const containerRect = container.getBoundingClientRect();

		let closestId: string | null = null;
		let minDiff = Infinity;
		const newlyReadIds: string[] = [];

		// Mapから直接要素を取得して計算
		itemsRef.current.forEach((item, id) => {
			const rect = item.getBoundingClientRect();

			// 既読判定: 要素がコンテナの表示領域に少しでも入っているか
			if (rect.top < containerRect.bottom && rect.bottom > containerRect.top) {
				newlyReadIds.push(id);
			}

			// 最上部の投稿判定
			const diff = Math.abs(rect.top - containerRect.top);
			if (diff < minDiff && rect.bottom > containerRect.top) {
				minDiff = diff;
				closestId = id;
			}
		});

		if (newlyReadIds.length > 0) onReadDetected(newlyReadIds);

		if (closestId && lastViewedIds[currentTab] !== closestId) {
			setLastViewedIds((prev) => ({ ...prev, [currentTab]: closestId }));
		}
	}, [currentTab, lastViewedIds, onReadDetected]);

	// タブ切り替え時のスクロール位置復元 (DOMの再描画前に同期的に実行)
	useLayoutEffect(() => {
		const targetId = lastViewedIds[currentTab];
		if (targetId && containerRef.current) {
			// Mapから対象要素の参照を取得
			const el = itemsRef.current.get(targetId);
			if (el) {
				el.scrollIntoView({ block: "start" });
			} else {
				containerRef.current.scrollTop = 0;
			}
		} else if (containerRef.current) {
			containerRef.current.scrollTop = 0;
		}
	}, [currentTab]);

	return { containerRef, itemsRef, registerItem, handleScroll };
};
