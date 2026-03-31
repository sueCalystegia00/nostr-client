import { nip19 } from "nostr-tools";

/**
 * Uint8Arrayをhex文字列に変換
 */
function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/**
 * hex文字列をUint8Arrayに変換
 */
function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16);
	}
	return bytes;
}

/**
 * hex形式の秘密鍵が有効かどうかを検証
 * @param hex 検証対象の文字列
 * @returns 有効な場合はtrue
 */
function isValidHex(hex: string): boolean {
	// 64文字の16進数かどうかを検証
	return /^[0-9a-fA-F]{64}$/.test(hex);
}

/**
 * 秘密鍵の値オブジェクト
 *
 * DDDの値オブジェクトとして実装され、以下の特性を持つ：
 * - 不変性（Immutability）: 一度生成されたら値を変更できない
 * - 自己検証（Self-Validation）: コンストラクタでバリデーションを実行
 * - 等価性（Equality）: 値による比較をサポート
 * - 型安全性（Type Safety）: string型ではなくPrivateKey型として扱う
 *
 * セキュリティ要件:
 * - エラーメッセージに秘密鍵の内容を含めない
 * - toString()での秘密鍵の漏洩を防ぐ
 * - toJSON()での秘密鍵のログ出力を防ぐ
 */
export class PrivateKey {
	private readonly hexValue: string;

	/**
	 * プライベートコンストラクタ
	 * ファクトリーメソッド経由でのみインスタンス化可能
	 * @param hexValue 検証済みのhex形式の秘密鍵
	 */
	private constructor(hexValue: string) {
		this.hexValue = hexValue;
	}

	/**
	 * nsec形式の秘密鍵から値オブジェクトを生成
	 * @param nsec nsec形式の秘密鍵（例: nsec1...）
	 * @returns PrivateKeyインスタンス
	 * @throws nsec形式が不正な場合
	 */
	static fromNsec(nsec: string): PrivateKey {
		const trimmed = nsec.trim();

		if (!trimmed.startsWith("nsec")) {
			throw new Error("Invalid format: must start with 'nsec'");
		}

		try {
			const decoded = nip19.decode(trimmed);
			if (decoded.type !== "nsec") {
				throw new Error("Invalid nsec format: not a private key");
			}
			const hexValue = bytesToHex(decoded.data as Uint8Array);
			return new PrivateKey(hexValue);
		} catch (error) {
			// デコードエラー時は秘密鍵の内容を含めない
			if (error instanceof Error && error.message.includes("Invalid nsec")) {
				throw error;
			}
			throw new Error("Invalid nsec format. Please check your private key.");
		}
	}

	/**
	 * hex形式の秘密鍵から値オブジェクトを生成
	 * @param hex hex形式の秘密鍵（64文字の16進数）
	 * @returns PrivateKeyインスタンス
	 * @throws hex形式が不正な場合
	 */
	static fromHex(hex: string): PrivateKey {
		const trimmed = hex.trim();

		if (!isValidHex(trimmed)) {
			throw new Error("Invalid hex format: must be 64 hexadecimal characters");
		}

		return new PrivateKey(trimmed.toLowerCase());
	}

	/**
	 * 任意の形式の秘密鍵から値オブジェクトを生成
	 * nsec形式とhex形式の両方をサポート
	 * @param input ユーザー入力の秘密鍵
	 * @returns PrivateKeyインスタンス
	 * @throws 不正な形式の場合
	 */
	static fromString(input: string): PrivateKey {
		const trimmed = input.trim();

		if (trimmed.length === 0) {
			throw new Error("Private key cannot be empty");
		}

		// nsec形式の場合
		if (trimmed.startsWith("nsec")) {
			return PrivateKey.fromNsec(trimmed);
		}

		// hex形式の場合
		if (isValidHex(trimmed)) {
			return PrivateKey.fromHex(trimmed);
		}

		throw new Error(
			"Invalid private key format. Please provide nsec or hex format.",
		);
	}

	/**
	 * hex形式で秘密鍵を取得
	 * @returns hex形式の秘密鍵（64文字）
	 */
	toHex(): string {
		return this.hexValue;
	}

	/**
	 * nsec形式で秘密鍵を取得
	 * @returns nsec形式の秘密鍵
	 */
	toNsec(): string {
		const bytes = hexToBytes(this.hexValue);
		return nip19.nsecEncode(bytes);
	}

	/**
	 * 別のPrivateKeyインスタンスと等価かどうかを判定
	 * @param other 比較対象のPrivateKey
	 * @returns 等価な場合はtrue
	 */
	equals(other: PrivateKey): boolean {
		return this.hexValue === other.hexValue;
	}

	/**
	 * セキュリティ: toString()での秘密鍵の漏洩を防ぐ
	 * @returns セキュアな文字列表現
	 */
	toString(): string {
		return "[PrivateKey: ***REDACTED***]";
	}

	/**
	 * セキュリティ: toJSON()での秘密鍵のログ出力を防ぐ
	 * @returns セキュアなJSON表現
	 */
	toJSON(): string {
		return "[PrivateKey: ***REDACTED***]";
	}
}
