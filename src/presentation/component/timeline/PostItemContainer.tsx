import { useCallback, useState } from "react";
import type { NostrPost } from "../../../domain/model/nostr";
import { useDI } from "../../context/diContext";
import { PostItemPresenter } from "./PostItemPresenter";

interface Props {
	event: NostrPost;
	onAction: (msg: string) => void;
	registerItem: (id: string, el: HTMLElement | null) => void;
}

export const PostItemContainer = ({ event, onAction, registerItem }: Props) => {
	const [liked, setLiked] = useState(false);
	const [showLikeAnim, setShowLikeAnim] = useState(false);

	const { postUsecase } = useDI();

	const handleLike = useCallback(async () => {
		if (liked) return;
		try {
			await postUsecase.react(event.id, event.pubkey);
			setLiked(true);
			setShowLikeAnim(true);
			onAction("いいねしました");
			setTimeout(() => setShowLikeAnim(false), 1000);
		} catch (e) {
			console.error("Failed to react:", e);
			onAction("いいねに失敗しました");
		}
	}, [event.id, event.pubkey, liked, onAction, postUsecase]);

	return (
		<PostItemPresenter
			event={event}
			liked={liked}
			showLikeAnim={showLikeAnim}
			onLike={handleLike}
			registerItem={registerItem}
		/>
	);
};
