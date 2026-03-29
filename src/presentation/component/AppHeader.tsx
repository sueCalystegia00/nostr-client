import { AppBar, Badge, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import { Bell, Home, List } from "lucide-react";
import type { TabType } from "../../domain/model/ui";

/** ヘッダーナビゲーション */
const AppHeader = ({
	currentTab,
	onTabChange,
	unreadCount,
}: {
	currentTab: TabType;
	onTabChange: (tab: TabType) => void;
	unreadCount: number;
}) => (
	<AppBar position="sticky" color="inherit" elevation={1} sx={{ zIndex: 20 }}>
		<Toolbar variant="dense" sx={{ minHeight: 48, px: 2 }}>
			<Typography variant="h6" fontWeight="bold" color="text.primary">
				Nostr Client
			</Typography>
		</Toolbar>
		<Tabs
			value={currentTab}
			onChange={(_, val) => onTabChange(val as TabType)}
			variant="fullWidth"
			indicatorColor="primary"
			textColor="primary"
		>
			<Tab
				value="unread"
				icon={
					<Badge
						badgeContent={unreadCount}
						color="error"
						invisible={unreadCount === 0}
					>
						<Bell size={20} />
					</Badge>
				}
				iconPosition="start"
				label="未読"
				sx={{ minHeight: 48, textTransform: "none", fontWeight: "bold" }}
			/>
			<Tab
				value="home"
				icon={<Home size={20} />}
				iconPosition="start"
				label="ホーム"
				sx={{ minHeight: 48, textTransform: "none", fontWeight: "bold" }}
			/>
			<Tab
				value="list"
				icon={<List size={20} />}
				iconPosition="start"
				label="リスト"
				sx={{ minHeight: 48, textTransform: "none", fontWeight: "bold" }}
			/>
		</Tabs>
	</AppBar>
);

export default AppHeader;
