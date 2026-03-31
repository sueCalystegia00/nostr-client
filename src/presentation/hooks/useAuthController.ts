import { useNDK } from "@nostr-dev-kit/react";
import { useCallback } from "react";
import { PrivateKey } from "../../domain/valueObject/PrivateKey";
import { Nip07SignerAdapter } from "../../infrastructure/nostr/nip07SignerAdapter";
import { PrivateKeySignerAdapter } from "../../infrastructure/nostr/privateKeySignerAdapter";
import { useAuthStore } from "./useAuthStore";

export const useAuthController = () => {
	const { ndk } = useNDK();
	const {
		signerAdapter,
		activePubkey,
		isLoading,
		errorMessage,
		setSignerAdapter,
		setActivePubkey,
		setLoading,
		setError,
		reset,
	} = useAuthStore();

	const loginWithExtension = useCallback(async () => {
		if (!ndk) {
			setError("NDK not initialized");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const adapter = new Nip07SignerAdapter(ndk);
			const pubkey = await adapter.getPublicKey();
			setSignerAdapter(adapter);
			setActivePubkey(pubkey);
		} catch (e) {
			// エラーメッセージは秘密鍵を含まないように注意
			const message = e instanceof Error ? e.message : "Extension login failed";
			setError(message);
			throw e;
		} finally {
			setLoading(false);
		}
	}, [ndk, setSignerAdapter, setActivePubkey, setLoading, setError]);

	const loginWithPrivateKey = useCallback(
		async (privateKeyInput: string) => {
			if (!ndk) {
				setError("NDK not initialized");
				return;
			}

			setLoading(true);
			setError(null);

			try {
				// PrivateKey値オブジェクトでバリデーションを実行
				const privateKey = PrivateKey.fromString(privateKeyInput);

				// PrivateKey型をそのまま渡す（型安全性が向上）
				const adapter = new PrivateKeySignerAdapter(privateKey, ndk);
				const pubkey = await adapter.getPublicKey();
				setSignerAdapter(adapter);
				setActivePubkey(pubkey);
			} catch (e) {
				// エラーメッセージは秘密鍵を含まないように注意
				const message =
					e instanceof Error ? e.message : "Private key login failed";
				setError(message);
				throw e;
			} finally {
				setLoading(false);
			}
		},
		[ndk, setSignerAdapter, setActivePubkey, setLoading, setError],
	);

	const logout = useCallback(() => {
		reset();
	}, [reset]);

	return {
		isLoggedIn: signerAdapter !== null,
		activePubkey,
		isLoading,
		errorMessage,
		loginWithExtension,
		loginWithPrivateKey,
		logout,
	};
};
