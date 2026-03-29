import type React from "react";
import { createContext, useContext, useMemo } from "react";
import { PostUsecase } from "../../application/usecase/postUsecase";
import { TimelineUsecase } from "../../application/usecase/timelineUsecase";
import { NostrEventService } from "../../domain/service/nostrEventService";
import { NostrRelayService } from "../../domain/service/nostrRelayService";
import { Nos2xRepository } from "../../infrastructure/nostr/nos2xRepository";
import { NostrPostEventRepository } from "../../infrastructure/nostr/nostrPostEventRepository";
import { NostrRelayRepository } from "../../infrastructure/nostr/nostrRelayRepository";

interface UIDependencies {
	timelineUsecase: TimelineUsecase;
	postUsecase: PostUsecase;
}

export const DIContext = createContext<UIDependencies | null>(null);

export const DIProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const deps = useMemo(() => {
		// リポジトリ層のインスタンス化
		const nos2xRepo = new Nos2xRepository();
		const postEventRepo = new NostrPostEventRepository();
		const relayRepo = new NostrRelayRepository();

		// サービス層のインスタンス化（リポジトリを注入）
		const eventService = new NostrEventService(nos2xRepo, postEventRepo);
		const relayService = new NostrRelayService(nos2xRepo, relayRepo);

		// ユースケース層のインスタンス化（サービスを注入）
		return {
			timelineUsecase: new TimelineUsecase(eventService, relayService),
			postUsecase: new PostUsecase(eventService, relayService),
		};
	}, []);

	return <DIContext.Provider value={deps}>{children}</DIContext.Provider>;
};

export const useDI = (): UIDependencies => {
	const context = useContext(DIContext);
	if (!context) {
		throw new Error("useDI must be used within a DIProvider");
	}
	return context;
};
