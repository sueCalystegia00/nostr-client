import { Avatar, Box, Typography } from "@mui/material";
import { Heart, MessageSquare, Repeat2 } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PostUsecase } from "../../application/usecase/postUsecase";
import type { NostrPost } from "../../domain/model/nostr";
import type { TabType } from "../../domain/model/ui";
import { useScrollManager } from "../hooks/useScrollManager";
import { useSwipeGesture } from "../hooks/useSwipeGesture";

interface Props {
	timeline: NostrPost[];
	currentTab: TabType;
	readPostIds: Set<string>;
	markAsRead: (ids: string[]) => void;
	setToastMessage: (msg: string) => void;
}

export const Timeline = ({
	timeline,
	currentTab,
	readPostIds,
	markAsRead,
	setToastMessage,
}: Props) => {
	const { containerRef, handleScroll } = useScrollManager(
		currentTab,
		markAsRead,
	);

	// 初回マウント時にスクロール判定を発火
	useEffect(() => {
		handleScroll();
	}, [handleScroll]);

	const filteredEvents = useMemo(() => {
		switch (currentTab) {
			case "unread":
				return timeline.filter((e) => !readPostIds.has(e.id));
			case "home":
				return timeline; // ※実際にはここでホーム（フォロー中）のフィルタリングを行う
			case "list":
				return timeline; // ※実際にはここでリスト（特定ユーザー群）のフィルタリングを行う
		}
	}, [timeline, currentTab, readPostIds]);

	return (
		<Box
			component='main'
			ref={containerRef}
			onScroll={handleScroll}
			sx={{
				flex: 1,
				overflowY: "auto",
				overflowX: "hidden",
				scrollBehavior: "smooth",
			}}
		>
			<Box
				sx={{
					width: "100%",
					bgcolor: "background.paper",
					minHeight: "100%",
				}}
			>
				{filteredEvents.length === 0 ? (
					<Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
						表示する投稿がありません。
					</Box>
				) : (
					filteredEvents.map((event) => (
						<PostEventItem
							key={event.id}
							event={event}
							onAction={setToastMessage}
						/>
					))
				)}
			</Box>
		</Box>
	);
};

/** 投稿1件を表示するコンポーネント */
const PostEventItem = React.memo(
	({
		event,
		onAction,
	}: {
		event: NostrPost;
		onAction: (msg: string) => void;
	}) => {
		const [liked, setLiked] = useState(false);
		const [showLikeAnim, setShowLikeAnim] = useState(false);

		const postUsecase = useMemo(() => new PostUsecase(), []);

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

		// ロジックをフックに委譲
		const { translateX, isDragging, handlers } = useSwipeGesture(
			() => onAction("返信画面を開きます"), // Left Swipe
			() => onAction("リポストしました"), // Right Swipe
			handleLike, // Double Tap
		);

		const formatTime = (ts: number) => {
			const date = new Date(ts * 1000);
			const now = new Date();
			const diff = (now.getTime() - date.getTime()) / 1000;

			if (diff < 60) return `${Math.floor(diff)}秒前`;
			if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
			return `${date.toLocaleDateString()}·${date.toLocaleTimeString()}`;
		};

		const bgColor =
			translateX > 0 ? "#e0f2fe" : translateX < 0 ? "#dcfce3" : "transparent";

		const displayName =
			event.profile?.display_name ||
			event.profile?.name ||
			`${event.pubkey.slice(0, 8)}...`;

		return (
			<Box
				className='post-item'
				data-post-id={event.id}
				sx={{
					position: "relative",
					overflow: "hidden",
					borderBottom: 1,
					borderColor: "divider",
					bgcolor: bgColor,
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
						opacity: translateX > 20 ? Math.min((translateX - 20) / 40, 1) : 0,
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
						opacity:
							translateX < -20
								? Math.min((Math.abs(translateX) - 20) / 40, 1)
								: 0,
						display: "flex",
						alignItems: "center",
					}}
				>
					<Repeat2 size={24} />
				</Box>

				{/* コンテンツ本体 */}
				<Box
					component='article'
					{...handlers}
					sx={{
						p: 2,
						bgcolor: "background.paper",
						display: "flex",
						gap: 2,
						position: "relative",
						zIndex: 1,
						userSelect: "none",
						touchAction: "pan-y",
						transform: `translateX(${translateX}px)`,
						transition: isDragging ? "none" : "transform 0.2s ease-out",
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
							<Heart size={80} color='#ef4444' fill='#ef4444' />
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
								variant='subtitle2'
								fontWeight='bold'
								noWrap
								sx={{ pr: 1 }}
							>
								{displayName}
							</Typography>
							<Typography
								variant='caption'
								color='text.secondary'
								sx={{ whiteSpace: "nowrap" }}
							>
								{formatTime(event.created_at)}
							</Typography>
						</Box>
						<Typography
							variant='body2'
							color='text.primary'
							sx={{
								wordBreak: "break-word",
								whiteSpace: "pre-wrap",
								lineHeight: 1.6,
							}}
						>
							{event.content}
						</Typography>

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
									handleLike();
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
