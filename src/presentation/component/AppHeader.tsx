import {
	AppBar,
	Badge,
	Box,
	Button,
	Tab,
	Tabs,
	Toolbar,
	Typography,
} from "@mui/material";
import { Bell, Home, List } from "lucide-react";
import { useState } from "react";
import type { TabType } from "../model/ui";
import { LoginDialog } from "./auth/LoginDialog";

/** ヘッダーナビゲーション */
const AppHeader = ({
	currentTab,
	onTabChange,
	unreadCount,
	loginWithExtension,
	loginWithPrivateKey,
	logout,
	isLoggedIn,
	activePubkey,
	isLoading,
	errorMessage,
}: {
	currentTab: TabType;
	onTabChange: (tab: TabType) => void;
	unreadCount: number;
	loginWithExtension: () => Promise<void>;
	loginWithPrivateKey: (key: string) => Promise<void>;
	logout: () => void;
	isLoggedIn: boolean;
	activePubkey: string | null;
	isLoading: boolean;
	errorMessage: string | null;
}) => {
	const [loginDialogOpen, setLoginDialogOpen] = useState(false);

	return (
		<>
			<AppBar
				position='sticky'
				color='inherit'
				elevation={1}
				sx={{ zIndex: 20 }}
			>
				<Toolbar variant='dense' sx={{ minHeight: 48, px: 2 }}>
					<Typography variant='h6' fontWeight='bold' color='text.primary'>
						Nostr Client
					</Typography>
					<Box sx={{ flexGrow: 1 }} />
					{isLoggedIn ? (
						<Button
							color='primary'
							variant='contained'
							onClick={logout}
							disabled={isLoading}
						>
							Logout ({activePubkey?.slice(0, 8)}...)
						</Button>
					) : (
						<Button
							color='primary'
							variant='contained'
							onClick={() => setLoginDialogOpen(true)}
							disabled={isLoading}
						>
							Login
						</Button>
					)}
				</Toolbar>
				<Tabs
					value={currentTab}
					onChange={(_, val) => onTabChange(val as TabType)}
					variant='fullWidth'
					indicatorColor='primary'
					textColor='primary'
				>
					<Tab
						value='UNREAD'
						icon={
							<Badge
								badgeContent={unreadCount}
								color='error'
								invisible={unreadCount === 0}
							>
								<Bell size={20} />
							</Badge>
						}
						iconPosition='start'
						label='未読'
						sx={{ minHeight: 48, textTransform: "none", fontWeight: "bold" }}
					/>
					<Tab
						value='HOME'
						icon={<Home size={20} />}
						iconPosition='start'
						label='ホーム'
						sx={{ minHeight: 48, textTransform: "none", fontWeight: "bold" }}
					/>
					<Tab
						value='LIST'
						icon={<List size={20} />}
						iconPosition='start'
						label='リスト'
						sx={{ minHeight: 48, textTransform: "none", fontWeight: "bold" }}
					/>
				</Tabs>
			</AppBar>

			<LoginDialog
				open={loginDialogOpen}
				onClose={() => setLoginDialogOpen(false)}
				onLoginWithExtension={loginWithExtension}
				onLoginWithPrivateKey={loginWithPrivateKey}
				isLoading={isLoading}
				errorMessage={errorMessage}
			/>
		</>
	);
};

export default AppHeader;
