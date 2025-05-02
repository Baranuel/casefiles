"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
  useRef,
} from "react";
import useWebSocket from "react-use-websocket";
import { useConfig } from "./ConfigProvider";
import { useReceiveSocketMessage } from "@/hooks/use-receive-socket-message";
import { useWsCacheUpdate } from "@/hooks/use-ws-cache-update";
import type { WsMessage } from "../types/sockets.js";

interface SocketContextType {
  lastMessage: MessageEvent<string> | null;
  uniqueWsId: string;
}

const defaultState: SocketContextType = {
  lastMessage: null,
  uniqueWsId: "",
};

const SocketContext = createContext<SocketContextType>(defaultState);
export const useSocketContext = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
  caseId: string;
  uniqueWsId: string;
}

export const SocketProvider = ({
  children,
  caseId,
  uniqueWsId,
}: SocketProviderProps) => {
  const { BASE_API_URL } = useConfig();
  const { parseSocketData } = useReceiveSocketMessage();
  const { wsElementCreate } = useWsCacheUpdate(caseId);

  const pendingRef = useRef<WsMessage[]>([]);
  const timerRef = useRef<number>(0);

  const { lastMessage } = useWebSocket(
    `${BASE_API_URL}/cases/${caseId}/ws?wsId=${uniqueWsId}`,
    {
      shouldReconnect: () => true,
      heartbeat: {
        message: "ping",
        returnMessage: "pong",
        timeout: 60000,
        interval: 20000,
      },
    }
  );

  // whenever a new raw message arrives, enqueue + debounce a batch flush
  useEffect(() => {
    if (!lastMessage) return;

    const msg = parseSocketData(lastMessage.data);
    pendingRef.current.push(msg);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      // keep only the last message per payload.id
      const grabLastMessageMap = new Map<string, WsMessage>();

      for (const message of pendingRef.current) {
        grabLastMessageMap.set(message.payload.id, message);
      }

      for (const message of grabLastMessageMap.values()) {
        if (message.type === "CREATE") {
          wsElementCreate("case-elements", message.payload);
        }
        // handle UPDATE / DELETE
      }
      pendingRef.current = [];
      timerRef.current = 0;
    }, 100);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lastMessage, parseSocketData, wsElementCreate]);

  const value = useMemo(
    () => ({ lastMessage, uniqueWsId }),
    [lastMessage, uniqueWsId]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
