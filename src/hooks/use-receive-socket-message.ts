import { RawWsMessageSchema, WsMessage } from "@/types/sockets"
import { useCallback } from "react";

export const useReceiveSocketMessage = () => {

  const parseSocketData = useCallback((payload: unknown): WsMessage => {

    const result = RawWsMessageSchema.safeParse(payload);
    if (!result.success) {
      throw new Error("Invalid WebSocket message: " + result.error.message);
    }
    return result.data;
  }, [])

  return { parseSocketData };
}
