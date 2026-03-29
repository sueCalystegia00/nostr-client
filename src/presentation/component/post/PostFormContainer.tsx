import { useState } from "react";
import { usePostController } from "../../hooks/usePostController";
import { PostFormPresenter } from "./PostFormPresenter";

export const PostFormContainer = () => {
	const [content, setContent] = useState("");
	const { post } = usePostController();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;
		try {
			await post(content);
			setContent("");
			// TODO: Refresh timeline after posting
		} catch (error) {
			console.error(error);
			alert((error as Error).message);
		}
	};

	return (
		<PostFormPresenter
			content={content}
			onChange={setContent}
			onSubmit={handleSubmit}
		/>
	);
};
