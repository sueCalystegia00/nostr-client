import type { Event as NostrEvent } from "nostr-tools/pure";

export type PrivateKey = {
	value: string;
};

export type PublicKey = {
	value: string;
};

export interface Relay {
	url: string;
}

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

export type EnrichedEvent = NostrEvent & {
	profile?: UserProfile;
};
