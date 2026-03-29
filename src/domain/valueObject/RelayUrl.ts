export class RelayUrl {
	private readonly _value: string;

	// private constructor により、ファクトリメソッド経由でのみ生成を許可する
	private constructor(value: string) {
		this._value = RelayUrl.normalize(value);
	}

	/**
	 * 与えられた文字列からRelayUrl値オブジェクトを生成する
	 * 無効なURLフォーマットの場合は例外をスローする
	 */
	public static create(url: string): RelayUrl {
		return new RelayUrl(url);
	}

	public get value(): string {
		return this._value;
	}

	/**
	 * 値オブジェクトの等価性評価
	 */
	public equals(other: RelayUrl): boolean {
		return this._value === other.value;
	}

	/**
	 * RFC 3986に準拠したURLの正規化
	 * 同一リレーへの重複接続を防ぐためのドメインルール
	 */
	private static normalize(url: string): string {
		try {
			const parsed = new URL(url);
			if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
				throw new Error(`Invalid WebSocket protocol: ${parsed.protocol}`);
			}
			// スキームとホスト名の小文字化、パスの維持
			let normalized = `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;

			// Nostrエコシステムの慣習として、末尾のスラッシュを除去して統一する [17]
			if (normalized.endsWith("/")) {
				normalized = normalized.slice(0, -1);
			}
			return normalized;
		} catch (_e) {
			throw new Error(`Invalid Relay URL format: ${url}`);
		}
	}

	public toString(): string {
		return this._value;
	}
}
