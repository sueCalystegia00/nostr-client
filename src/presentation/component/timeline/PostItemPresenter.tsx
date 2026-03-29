import { Avatar, Box, Typography } from "@mui/material";
import { Heart, MessageSquare, Repeat2 } from "lucide-react";
import React from "react";
import type { NostrPost } from "../../../domain/model/nostr";
import { renderContent } from "./TimelineUtils";

interface Props {
	event: NostrPost;
	liked: boolean;
	showLikeAnim: boolean;
	onLike: () => void;
	registerItem: (id: string, el: HTMLElement | null) => void;
}

const formatTime = (ts: number) => {
	const date = new Date(ts * 1000);
	const now = new Date();
	const diff = (now.getTime() - date.getTime()) / 1000;

	if (diff < 60) return `${Math.floor(diff)}秒前`;
	if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
	return `${date.toLocaleDateString()}·${date.toLocaleTimeString()}`;
};

export const PostItemPresenter = React.memo(
	({ event, liked, showLikeAnim, onLike, registerItem }: Props) => {
		const displayName =
			event.profile?.display_name ||
			event.profile?.name ||
			`${event.pubkey.slice(0, 8)}...`;

		return (
			<Box
				className="post-item"
				data-post-id={event.id}
				ref={(el) => registerItem(event.id, el as HTMLElement | null)}
				sx={{
					position: "relative",
					overflow: "hidden",
					borderBottom: 1,
					borderColor: "divider",
				}}
			>
				{/* 背景アイコン (返信・リポスト) */}
				<Box
					sx={{
						position: "absolute",
						left: 16,
						top: "50%",
						transform: "translateY(-50%)",
						color: "primary.main",
						display: "flex",
						alignItems: "center",
					}}
				>
					<MessageSquare size={24} />
				</Box>
				<Box
					sx={{
						position: "absolute",
						right: 16,
						top: "50%",
						transform: "translateY(-50%)",
						color: "#22c55e",
						display: "flex",
						alignItems: "center",
					}}
				>
					<Repeat2 size={24} />
				</Box>

				{/* コンテンツ本体 */}
				<Box
					component="article"
					sx={{
						p: 2,
						bgcolor: "background.paper",
						display: "flex",
						gap: 2,
						position: "relative",
						zIndex: 1,
						userSelect: "none",
						touchAction: "pan-y",
					}}
				>
					{/* いいねアニメーション */}
					{showLikeAnim && (
						<Box
							sx={{
								position: "absolute",
								inset: 0,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								pointerEvents: "none",
								zIndex: 2,
								animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) forwards",
								"@keyframes ping": {
									"0%": { transform: "scale(1)", opacity: 0.8 },
									"75%, 100%": { transform: "scale(2.5)", opacity: 0 },
								},
							}}
						>
							<Heart size={80} color="#ef4444" fill="#ef4444" />
						</Box>
					)}

					<Avatar
						src={event.profile?.picture}
						alt={event.profile?.name}
						sx={{ width: 48, height: 48, bgcolor: "grey.200" }}
					/>

					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "baseline",
								mb: 0.5,
							}}
						>
							<Typography
								variant="subtitle2"
								fontWeight="bold"
								noWrap
								sx={{ pr: 1 }}
							>
								{displayName}
							</Typography>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ whiteSpace: "nowrap" }}
							>
								{formatTime(event.created_at)}
							</Typography>
						</Box>
						<Box sx={{ mt: 0.5, mb: 1.5 }}>{renderContent(event.content)}</Box>

						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 3,
								mt: 1.5,
								color: "text.disabled",
							}}
						>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									cursor: "pointer",
									"&:hover": { color: "primary.main" },
								}}
							>
								<MessageSquare size={16} />
							</Box>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									cursor: "pointer",
									"&:hover": { color: "#22c55e" },
								}}
							>
								<Repeat2 size={16} />
							</Box>
							<Box
								onClick={(e) => {
									e.stopPropagation();
									onLike();
								}}
								sx={{
									display: "flex",
									alignItems: "center",
									cursor: "pointer",
									color: liked ? "error.main" : "inherit",
									"&:hover": { color: "error.main" },
								}}
							>
								<Heart size={16} fill={liked ? "currentColor" : "none"} />
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		);
	},
);
