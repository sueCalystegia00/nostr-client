import type React from "react";

interface Props {
	content: string;
	onChange: (content: string) => void;
	onSubmit: (e: React.FormEvent) => void;
}

export const PostFormPresenter = ({ content, onChange, onSubmit }: Props) => {
	return (
		<form onSubmit={onSubmit}>
			<textarea
				value={content}
				onChange={(e) => onChange(e.target.value)}
				placeholder="What's on your mind?"
			/>
			<button type="submit">Post</button>
		</form>
	);
};
