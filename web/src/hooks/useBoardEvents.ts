import { useEffect, useRef } from "react";

export type BoardEventType =
  | "tickets.updated"
  | "projects.updated"
  | "teams.updated"
  | "labels.updated"
  | "connected";

const EVENT_TYPES: BoardEventType[] = [
  "tickets.updated",
  "projects.updated",
  "teams.updated",
  "labels.updated",
  "connected",
];

export function useBoardEvents(onEvent: (type: BoardEventType) => void): void {
  const cbRef = useRef(onEvent);
  cbRef.current = onEvent;

  useEffect(() => {
    const es = new EventSource("/api/events");
    const listeners: Array<{ type: BoardEventType; fn: () => void }> = EVENT_TYPES.map(
      (type) => {
        const fn = () => cbRef.current(type);
        es.addEventListener(type, fn);
        return { type, fn };
      }
    );
    return () => {
      for (const { type, fn } of listeners) {
        es.removeEventListener(type, fn);
      }
      es.close();
    };
  }, []);
}
