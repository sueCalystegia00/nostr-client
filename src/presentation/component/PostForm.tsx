import { useState } from "react";
import { useDI } from "../context/diContext";

export const PostForm = () => {
	const [content, setContent] = useState("");
	const { postUsecase } = useDI();

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
			<button type="submit">Post</button>
		</form>
	);
};
