import { Box } from "@mui/material";
import type React from "react";
import type { NostrPost } from "../../../domain/model/nostr";
import { PostItemContainer } from "./PostItemContainer";

interface Props {
	filteredEvents: NostrPost[];
	containerRef: React.RefObject<HTMLDivElement | null>;
	handleScroll: () => void;
	setToastMessage: (msg: string) => void;
	registerItem: (id: string, el: HTMLElement | null) => void;
}

export const TimelinePresenter = ({
	filteredEvents,
	containerRef,
	handleScroll,
	setToastMessage,
	registerItem,
}: Props) => {
	return (
		<Box
			component="main"
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
						<PostItemContainer
							key={event.id}
							event={event}
							onAction={setToastMessage}
							registerItem={registerItem}
						/>
					))
				)}
			</Box>
		</Box>
	);
};
