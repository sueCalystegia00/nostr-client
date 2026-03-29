import type { RelayUrl } from "../valueObject/RelayUrl";

export type PrivateKey = {
	value: string;
};

export type PublicKey = {
	value: string;
};

export interface RelayModel {
	url: string;
}

// NIP-65およびNIP-07に基づくパーミッションマーカーを定義する型
export type RelayMarker = "read" | "write" | "both";

// リレーの接続情報を示すエンティティ
export interface RelayConfig {
	url: RelayUrl;
	marker: RelayMarker;
}

export type NostrEvent = {
	kind: number;
	tags: string[][];
	content: string;
	created_at: number;
	pubkey: string;
	id: string;
	sig: string;
};

export type UnsignedEvent = {
	kind: number;
	tags: string[][];
	content: string;
	created_at: number;
	pubkey: string;
};

export type UserProfile = {
	pubkey: string;
	name?: string;
	display_name?: string;
	picture?: string;
	banner?: string;
	website?: string;
	about?: string;
	nip05?: string;
	lud16?: string;
};

export type NostrPost = NostrEvent & {
	profile?: UserProfile;
};
