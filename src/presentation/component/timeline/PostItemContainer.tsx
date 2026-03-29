import { useCallback, useState } from "react";
import type { NostrPost } from "../../../domain/model/nostr";
import { usePostController } from "../../hooks/usePostController";
import { PostItemPresenter } from "./PostItemPresenter";

interface Props {
	event: NostrPost;
	onAction: (msg: string) => void;
	registerItem: (id: string, el: HTMLElement | null) => void;
}

export const PostItemContainer = ({ event, onAction, registerItem }: Props) => {
	const [liked, setLiked] = useState(false);
	const [showLikeAnim, setShowLikeAnim] = useState(false);

	const { react } = usePostController();

	const handleLike = useCallback(async () => {
		if (liked) return;
		try {
			await react(event.id, event.pubkey);
			setLiked(true);
			setShowLikeAnim(true);
			onAction("いいねしました");
			setTimeout(() => setShowLikeAnim(false), 1000);
		} catch (e) {
			console.error("Failed to react:", e);
			onAction("いいねに失敗しました");
		}
	}, [event.id, event.pubkey, liked, onAction, react]);

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
