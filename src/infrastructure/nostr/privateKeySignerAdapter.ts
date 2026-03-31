import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import type {
	NostrEvent,
	RelayConfig,
	UnsignedEvent,
} from "../../domain/model/nostr";
import type { ISignerAdapter } from "../../domain/repository/ISignerAdapter";
import type { PrivateKey } from "../../domain/valueObject/PrivateKey";

export class PrivateKeySignerAdapter implements ISignerAdapter {
	private signer: NDKPrivateKeySigner;
	private ndk: NDK;

	/**
	 * PrivateKeySignerAdapterのコンストラクタ
	 * @param privateKey PrivateKey値オブジェクト
	 * @param ndk NDKインスタンス
	 */
	constructor(privateKey: PrivateKey, ndk: NDK) {
		const hexKey = privateKey.toHex();
		this.signer = new NDKPrivateKeySigner(hexKey);
		this.ndk = ndk;
	}

	async getPublicKey(): Promise<string> {
		const user = await this.signer.user();
		return user.pubkey;
	}

	async getLocalRelays(): Promise<RelayConfig[]> {
		// Private key signers do not have a concept of local extension relays.
		return [];
	}

	async signEvent(event: UnsignedEvent): Promise<NostrEvent> {
		const ndkEvent = new NDKEvent(this.ndk);
		ndkEvent.kind = event.kind;
		ndkEvent.tags = event.tags;
		ndkEvent.content = event.content;
		ndkEvent.created_at = event.created_at;
		ndkEvent.pubkey = await this.getPublicKey();

		await ndkEvent.sign(this.signer);

		return {
			kind: ndkEvent.kind as number,
			tags: ndkEvent.tags,
			content: ndkEvent.content,
			created_at: ndkEvent.created_at as number,
			pubkey: ndkEvent.pubkey,
			id: ndkEvent.id as string,
			sig: ndkEvent.sig as string,
		};
	}
}
