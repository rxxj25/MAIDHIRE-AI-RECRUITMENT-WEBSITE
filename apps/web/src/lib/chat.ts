import { useMutation } from "@tanstack/react-query";
import type { ChatMessageInput } from "@maidhire/shared";
import { post } from "./api";

export interface ChatReply {
  reply: string;
  fallback: boolean;
}

export const useSendChatMessage = () => useMutation({ mutationFn: (body: ChatMessageInput) => post<ChatReply>("/api/chat", body) });
