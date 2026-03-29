import { useRef, useState } from "react";

/** スワイプ・ドラッグのジェスチャーを管理するフック */
export const useSwipeGesture = (
	onSwipeLeft: () => void,
	onSwipeRight: () => void,
	onDoubleTap: () => void,
) => {
	const [translateX, setTranslateX] = useState(0);
	const pointerStartX = useRef<number | null>(null);
	const pointerStartY = useRef<number | null>(null);
	const lastTapTime = useRef<number>(0);

	const handlePointerDown = (e: React.PointerEvent) => {
		pointerStartX.current = e.clientX;
		pointerStartY.current = e.clientY;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	};

	const handlePointerMove = (e: React.PointerEvent) => {
		if (pointerStartX.current === null || pointerStartY.current === null)
			return;

		const diffX = e.clientX - pointerStartX.current;
		const diffY = e.clientY - pointerStartY.current;

		// 縦スクロール優先
		if (Math.abs(diffY) > Math.abs(diffX)) {
			setTranslateX(0);
			return;
		}
		setTranslateX(Math.max(-80, Math.min(80, diffX)));
	};

	const handlePointerUp = (e: React.PointerEvent) => {
		(e.target as HTMLElement).releasePointerCapture(e.pointerId);
		const now = Date.now();

		// タップ判定 (移動量がほぼない場合)
		const isTap =
			pointerStartX.current !== null &&
			pointerStartY.current !== null &&
			Math.abs(e.clientX - pointerStartX.current) < 10 &&
			Math.abs(e.clientY - pointerStartY.current) < 10;

		if (isTap) {
			if (now - lastTapTime.current < 300) {
				onDoubleTap();
				lastTapTime.current = 0;
			} else {
				lastTapTime.current = now;
			}
		} else {
			// スワイプ判定
			if (translateX > 50) onSwipeRight();
			else if (translateX < -50) onSwipeLeft();
		}

		setTranslateX(0);
		pointerStartX.current = null;
		pointerStartY.current = null;
	};

	const handlePointerCancel = (e: React.PointerEvent) => {
		(e.target as HTMLElement).releasePointerCapture(e.pointerId);
		setTranslateX(0);
		pointerStartX.current = null;
		pointerStartY.current = null;
	};

	return {
		translateX,
		isDragging: translateX !== 0,
		handlers: {
			onPointerDown: handlePointerDown,
			onPointerMove: handlePointerMove,
			onPointerUp: handlePointerUp,
			onPointerCancel: handlePointerCancel,
			onDoubleClick: onDoubleTap, // PC用の保険
		},
	};
};
