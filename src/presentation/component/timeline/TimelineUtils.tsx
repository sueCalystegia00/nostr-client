import { Box, Typography } from "@mui/material";
import type React from "react";

/** 投稿内のテキストから画像・動画URLを抽出して描画するヘルパー */
export const renderContent = (content: string) => {
	const urlRegex =
		/(https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|webp|mp4|webm|ogg|mov)(?:\?[^\s]*)?)/i;
	const parts = content.split(urlRegex);

	const elements: React.ReactNode[] = [];
	let mediaGroup: string[] = [];

	const isVideo = (url: string) =>
		/\.(mp4|webm|ogg|mov)(?:\?[^\s]*)?$/i.test(url);

	const flushMedia = () => {
		if (mediaGroup.length > 0) {
			elements.push(
				<Box
					key={`media-group-${elements.length}`}
					sx={{
						display: "grid",
						gridTemplateColumns:
							mediaGroup.length > 1 ? "repeat(2, 1fr)" : "1fr",
						gap: 1,
						mt: 1,
						mb: 1,
					}}
				>
					{mediaGroup.map((mediaUrl, i) => {
						const commonStyle = {
							width: "100%",
							height: mediaGroup.length > 1 ? "200px" : "auto",
							maxHeight: "400px",
							borderRadius: "8px",
							objectFit: (mediaGroup.length > 1
								? "cover"
								: "contain") as React.CSSProperties["objectFit"],
						};

						return isVideo(mediaUrl) ? (
							<video
								key={`${mediaUrl}-${i}`}
								src={mediaUrl}
								style={commonStyle}
								controls
								preload="metadata"
							/>
						) : (
							<img
								key={`${mediaUrl}-${i}`}
								src={mediaUrl}
								alt="post content"
								style={commonStyle}
								loading="lazy"
							/>
						);
					})}
				</Box>,
			);
			mediaGroup = [];
		}
	};

	parts.forEach((part) => {
		if (part.match(urlRegex)) {
			mediaGroup.push(part);
		} else {
			if (part.trim() === "" && mediaGroup.length > 0) {
				return;
			}
			if (part) {
				flushMedia();
				elements.push(
					<Typography
						key={`text-${elements.length}`}
						variant="body2"
						color="text.primary"
						component="span"
						sx={{
							wordBreak: "break-word",
							whiteSpace: "pre-wrap",
							lineHeight: 1.6,
						}}
					>
						{part}
					</Typography>,
				);
			}
		}
	});

	flushMedia();

	return elements;
};
