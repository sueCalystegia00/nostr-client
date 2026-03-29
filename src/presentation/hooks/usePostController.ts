import { useNDK } from "@nostr-dev-kit/react";
import { useMemo } from "react";
import { PostUsecase } from "../../application/usecase/postUsecase";
import { NostrEventService } from "../../domain/service/nostrEventService";
import { NostrRelayService } from "../../domain/service/nostrRelayService";
import { NdkEventRepository } from "../../infrastructure/nostr/ndkEventRepository";
import { Nos2xRepository } from "../../infrastructure/nostr/nos2xRepository";
import { NostrRelayRepository } from "../../infrastructure/nostr/nostrRelayRepository";

export const usePostController = () => {
	const { ndk } = useNDK();

	const postUsecase = useMemo(() => {
		if (!ndk) return null;

		const ndkEventRepo = new NdkEventRepository(ndk);
		const nos2xRepo = new Nos2xRepository();
		const relayRepo = new NostrRelayRepository();

		const eventService = new NostrEventService(nos2xRepo, ndkEventRepo);
		const relayService = new NostrRelayService(nos2xRepo, relayRepo);

		return new PostUsecase(eventService, relayService);
	}, [ndk]);

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
