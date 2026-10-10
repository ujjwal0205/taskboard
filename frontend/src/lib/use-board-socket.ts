"use client";

import { Client } from "@stomp/stompjs";
import { useEffect, useEffectEvent, useState } from "react";

import type { BoardEvent } from "./types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws";

export type ConnectionStatus = "connecting" | "live" | "offline";

type Handlers = {
  /** Called on every (re)connect, so the caller can refetch anything missed while offline. */
  onConnect: () => void;
  onEvent: (event: BoardEvent) => void;
};

/** Subscribes to the board's STOMP topic for as long as the component is mounted and visible. */
export function useBoardSocket(boardId: string, token: string, handlers: Handlers): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const onConnect = useEffectEvent(handlers.onConnect);
  const onEvent = useEffectEvent(handlers.onEvent);

  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        setStatus("live");
        client.subscribe(`/topic/board/${boardId}`, (message) => {
          onEvent(JSON.parse(message.body) as BoardEvent);
        });
        onConnect();
      },
      onWebSocketClose: () => setStatus("offline"),
      onStompError: () => setStatus("offline"),
    });

    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [boardId, token]);

  return status;
}
