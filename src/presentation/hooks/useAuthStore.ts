import { create } from "zustand";
import type { ISignerAdapter } from "../../domain/repository/ISignerAdapter";

interface AuthState {
	/** 現在有効な署名アダプター。nullの場合は未ログイン状態を示す */
	signerAdapter: ISignerAdapter | null;
	setSignerAdapter: (adapter: ISignerAdapter | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	signerAdapter: null, // デフォルトはnull (明示的にログインするまで)
	setSignerAdapter: (adapter) => set({ signerAdapter: adapter }),
}));
