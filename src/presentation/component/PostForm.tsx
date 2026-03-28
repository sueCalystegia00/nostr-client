import { useState } from "react";
import { PostUsecase } from "../../application/usecase/postUsecase";
import type { Relay } from "../../domain/model/nostr";

const relays: Relay[] = [{ url: "wss://relay.damus.io" }];

export const PostForm = () => {
	const [content, setContent] = useState("");
	const postUsecase = new PostUsecase(relays);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;
		try {
			await postUsecase.post(content);
			setContent("");
			// TODO: Refresh timeline after posting
		} catch (error) {
			console.error(error);
			alert((error as Error).message);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder="What's on your mind?"
			/>
			<button type='submit'>Post</button>
		</form>
	);
};
