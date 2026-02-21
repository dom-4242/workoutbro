export const PUSHER_EVENTS = {
  // Trainer → Athlete
  ROUND_RELEASED: "round-released",
  ROUND_UPDATED: "round-updated",
  ROUND_DELETED: "round-deleted",
  SESSION_CANCELLED: "session-cancelled",

  // Athlete → Trainer
  ROUND_COMPLETED: "round-completed",
  SESSION_COMPLETED: "session-completed",
} as const;

export type RoundReleasedEvent = {
  roundId: string;
  roundNumber: number;
};

export type RoundCompletedEvent = {
  roundId: string;
  roundNumber: number;
};

export type SessionCancelledEvent = {
  cancelledBy: "ATHLETE" | "TRAINER";
};

export function getSessionChannel(sessionId: string) {
  return `session-${sessionId}`;
}
