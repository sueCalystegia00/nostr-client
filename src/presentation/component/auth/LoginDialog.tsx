import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	TextField,
	Typography,
} from "@mui/material";
import { Key, X } from "lucide-react";
import { useState } from "react";

interface LoginDialogProps {
	open: boolean;
	onClose: () => void;
	onLoginWithExtension: () => Promise<void>;
	onLoginWithPrivateKey: (key: string) => Promise<void>;
	isLoading: boolean;
	errorMessage: string | null;
}

export const LoginDialog = ({
	open,
	onClose,
	onLoginWithExtension,
	onLoginWithPrivateKey,
	isLoading,
	errorMessage,
}: LoginDialogProps) => {
	const [privateKey, setPrivateKey] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const handleExtensionLogin = async () => {
		setLocalError(null);
		try {
			await onLoginWithExtension();
			// ログイン成功時はダイアログを閉じる
			onClose();
			setPrivateKey("");
		} catch (_e) {
			// エラーはuseAuthControllerで処理される
		}
	};

	const handlePrivateKeyLogin = async () => {
		setLocalError(null);

		if (!privateKey.trim()) {
			setLocalError("Please enter your private key");
			return;
		}

		try {
			await onLoginWithPrivateKey(privateKey);
			// ログイン成功時はダイアログを閉じる
			onClose();
			setPrivateKey("");
		} catch (_e) {
			// エラーはuseAuthControllerで処理される
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			setPrivateKey("");
			setLocalError(null);
			onClose();
		}
	};

	const displayError = errorMessage || localError;

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth='sm'
			fullWidth
			PaperProps={{
				sx: { borderRadius: 2 },
			}}
		>
			<DialogTitle sx={{ display: "flex", alignItems: "center", pb: 1 }}>
				<Key size={24} style={{ marginRight: 8 }} />
				Login to Nostr
				<Box sx={{ flexGrow: 1 }} />
				<IconButton
					onClick={handleClose}
					disabled={isLoading}
					size='small'
					aria-label='close'
				>
					<X size={20} />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ pt: 2 }}>
				{displayError && (
					<Alert severity='error' sx={{ mb: 2 }}>
						{displayError}
					</Alert>
				)}

				{/* NIP-07拡張機能ログイン（推奨） */}
				<Box sx={{ mb: 3 }}>
					<Typography variant='subtitle2' fontWeight='bold' gutterBottom>
						Recommended: Browser Extension
					</Typography>
					<Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
						Use a Nostr browser extension like nos2x or Alby to login securely
						without sharing your private key.
					</Typography>
					<Button
						variant='contained'
						color='primary'
						fullWidth
						onClick={handleExtensionLogin}
						disabled={isLoading}
						startIcon={
							isLoading ? <CircularProgress size={20} color='inherit' /> : null
						}
						sx={{ textTransform: "none" }}
					>
						{isLoading ? "Connecting..." : "Login with Extension"}
					</Button>
				</Box>

				<Divider sx={{ my: 2 }}>
					<Typography variant='body2' color='text.secondary'>
						OR
					</Typography>
				</Divider>

				{/* 秘密鍵入力（警告付き） */}
				<Box>
					<Typography variant='subtitle2' fontWeight='bold' gutterBottom>
						Login with Private Key
					</Typography>
					<Alert severity='warning' sx={{ mb: 2 }}>
						<Typography variant='body2'>
							⚠️ Only use this on trusted devices. Your private key will be
							stored in memory only and cleared on page reload.
						</Typography>
					</Alert>
					<TextField
						fullWidth
						type='password'
						label='Private Key (nsec or hex)'
						placeholder='nsec1... or 64-character hex'
						value={privateKey}
						onChange={(e) => setPrivateKey(e.target.value)}
						disabled={isLoading}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !isLoading) {
								handlePrivateKeyLogin();
							}
						}}
						sx={{ mb: 2 }}
					/>
					<Button
						variant='outlined'
						color='primary'
						fullWidth
						onClick={handlePrivateKeyLogin}
						disabled={isLoading || !privateKey.trim()}
						startIcon={
							isLoading ? <CircularProgress size={20} color='inherit' /> : null
						}
						sx={{ textTransform: "none" }}
					>
						{isLoading ? "Logging in..." : "Login with Private Key"}
					</Button>
				</Box>
			</DialogContent>
		</Dialog>
	);
};
