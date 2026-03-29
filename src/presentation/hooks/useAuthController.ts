import { useNDK } from "@nostr-dev-kit/react";
import { useCallback, useState } from "react";
import { Nip07SignerAdapter } from "../../infrastructure/nostr/nip07SignerAdapter";
import { PrivateKeySignerAdapter } from "../../infrastructure/nostr/privateKeySignerAdapter";
import { useAuthStore } from "./useAuthStore";

export const useAuthController = () => {
	const { ndk } = useNDK();
	const { signerAdapter, setSignerAdapter } = useAuthStore();
	const [activePubkey, setActivePubkey] = useState<string | null>(null);

	const loginWithExtension = useCallback(async () => {
		if (!ndk) throw new Error("NDK not initialized");
		try {
			const adapter = new Nip07SignerAdapter(ndk);
			const pubkey = await adapter.getPublicKey();
			setSignerAdapter(adapter);
			setActivePubkey(pubkey);
		} catch (e) {
			console.error("Extension login failed", e);
			throw e;
		}
	}, [ndk, setSignerAdapter]);

	const loginWithPrivateKey = useCallback(
		async (hexKey: string) => {
			if (!ndk) throw new Error("NDK not initialized");
			try {
				const adapter = new PrivateKeySignerAdapter(hexKey, ndk);
				const pubkey = await adapter.getPublicKey();
				setSignerAdapter(adapter);
				setActivePubkey(pubkey);
			} catch (e) {
				console.error("Private key login failed", e);
				throw e;
			}
		},
		[ndk, setSignerAdapter],
	);

	const logout = useCallback(() => {
		setSignerAdapter(null);
		setActivePubkey(null);
	}, [setSignerAdapter]);

	return {
		isLoggedIn: signerAdapter !== null,
		activePubkey,
		loginWithExtension,
		loginWithPrivateKey,
		logout,
	};
};
