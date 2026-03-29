import {
	Box,
	CssBaseline,
	createTheme,
	Snackbar,
	ThemeProvider,
} from "@mui/material";
import { useState } from "react";
import AppHeader from "./presentation/component/AppHeader";
import { TimelineContainer as Timeline } from "./presentation/component/timeline/TimelineContainer";
import { useReadReceipts } from "./presentation/hooks/useReadReceipts";
import { useTimeline } from "./presentation/hooks/useTimeline";
import type { TabType } from "./presentation/model/ui";

// --- MUIテーマ定義 ---
const theme = createTheme({
	palette: {
		background: {
			default: "#f3f4f6", // アプリ全体の背景色
			paper: "#ffffff",
		},
		primary: {
			main: "#3b82f6", // タブのインジケーター等
		},
		error: {
			main: "#ef4444", // 未読バッジ、いいね等
		},
	},
	typography: {
		fontFamily: "inherit",
	},
});

const App = () => {
	// 1. データ取得 (Infrastructure層の呼び出し)
	const { timeline } = useTimeline();

	// 2. 状態・ユースケース管理 (Application層の呼び出し)
	const [currentTab, setCurrentTab] = useState<TabType>("HOME");
	const [toastMessage, setToastMessage] = useState<string | null>(null);

	const { readPostIds, markAsRead, unreadCount } = useReadReceipts(
		timeline.length,
	);

	// 3. UIの描画 (Presentation層への連携)
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					height: "100vh",
					width: "100%",
					overflow: "hidden",
					bgcolor: "background.default",
				}}
			>
				<AppHeader
					currentTab={currentTab}
					onTabChange={setCurrentTab}
					unreadCount={unreadCount}
				/>

				<Timeline
					timeline={timeline}
					currentTab={currentTab}
					markAsRead={markAsRead}
					readPostIds={readPostIds}
					setToastMessage={setToastMessage}
				/>

				<Snackbar
					open={!!toastMessage}
					autoHideDuration={2000}
					onClose={() => setToastMessage(null)}
					message={toastMessage}
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
					sx={{ bottom: { xs: 24, sm: 24 } }}
				/>
			</Box>
		</ThemeProvider>
	);
};

export default App;
