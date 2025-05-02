import { RawWsMessageSchema, WsMessage } from "@/types/sockets"
import { useCallback } from "react";

export const useReceiveSocketMessage = () => {

  const parseSocketData = useCallback((message: unknown): WsMessage => {

    const result = RawWsMessageSchema.safeParse(message);
    if (!result.success) {
      throw new Error("Invalid WebSocket message: " + result.error.message);
    }
    return result.data;
  }, [])

  return { parseSocketData };
}
