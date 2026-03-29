import { useNDK } from "@nostr-dev-kit/react";
import { useMemo } from "react";
import { PostUsecase } from "../../application/usecase/postUsecase";
import { NostrEventService } from "../../domain/service/nostrEventService";
import { NostrRelayService } from "../../domain/service/nostrRelayService";
import { NdkEventRepository } from "../../infrastructure/nostr/ndkEventRepository";
import { NostrRelayRepository } from "../../infrastructure/nostr/nostrRelayRepository";
import { useAuthStore } from "./useAuthStore";

export const usePostController = () => {
	const { ndk } = useNDK();
	const { signerAdapter } = useAuthStore();

	const postUsecase = useMemo(() => {
		if (!ndk) return null;

		const ndkEventRepo = new NdkEventRepository(ndk);
		const relayRepo = new NostrRelayRepository();

		const eventService = new NostrEventService(signerAdapter, ndkEventRepo);
		const relayService = new NostrRelayService(signerAdapter, relayRepo);

		return new PostUsecase(eventService, relayService);
	}, [ndk, signerAdapter]);

	const post = async (content: string) => {
		if (!postUsecase) throw new Error("NDK is not initialized");
		return postUsecase.post(content);
	};

	const react = async (eventId: string, pubkey: string) => {
		if (!postUsecase) throw new Error("NDK is not initialized");
		return postUsecase.react(eventId, pubkey);
	};

	return {
		post,
		react,
	};
};
