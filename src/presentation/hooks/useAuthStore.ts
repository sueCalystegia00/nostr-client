import { create } from "zustand";
import type { ISignerAdapter } from "../../domain/repository/ISignerAdapter";

interface AuthState {
	/** 現在有効な署名アダプター。nullの場合は未ログイン状態を示す */
	signerAdapter: ISignerAdapter | null;
	/** ログイン中のユーザーの公開鍵 */
	activePubkey: string | null;
	/** ログイン処理中かどうか */
	isLoading: boolean;
	/** 認証関連のエラーメッセージ */
	errorMessage: string | null;

	setSignerAdapter: (adapter: ISignerAdapter | null) => void;
	setActivePubkey: (pubkey: string | null) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	reset: () => void;
}

const initialState = {
	signerAdapter: null,
	activePubkey: null,
	isLoading: false,
	errorMessage: null,
};

export const useAuthStore = create<AuthState>((set) => ({
	...initialState,
	setSignerAdapter: (adapter) => set({ signerAdapter: adapter }),
	setActivePubkey: (pubkey) => set({ activePubkey: pubkey }),
	setLoading: (loading) => set({ isLoading: loading }),
	setError: (error) => set({ errorMessage: error }),
	reset: () => set(initialState),
}));
