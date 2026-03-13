"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher-client";
import { PUSHER_EVENTS, getSessionChannel } from "@/lib/pusher-events";

type Props = {
  sessionId: string;
};

export function AthleteSubscriber({ sessionId }: Props) {
  const router = useRouter();

  useEffect(() => {
    const channel = pusherClient.subscribe(getSessionChannel(sessionId));

    channel.bind(PUSHER_EVENTS.ROUND_RELEASED, () => {
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.ROUND_UPDATED, () => {
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.ROUND_DELETED, () => {
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.ROUND_COMPLETED, () => {
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.SESSION_CANCELLED, () => {
      router.push("/dashboard");
    });

    channel.bind(PUSHER_EVENTS.SESSION_COMPLETED, () => {
      setTimeout(() => window.location.reload(), 300);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [sessionId, router]);

  return null;
}

export function TrainerSubscriber({ sessionId }: Props) {
  const router = useRouter();

  useEffect(() => {
    const channel = pusherClient.subscribe(getSessionChannel(sessionId));

    channel.bind(PUSHER_EVENTS.ROUND_RELEASED, () => {
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.ROUND_UPDATED, () => {
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.ROUND_COMPLETED, () => {
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.SESSION_COMPLETED, () => {
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.SESSION_CANCELLED, () => {
      router.push("/dashboard");
    });

    channel.bind("round-saved", () => {
      setTimeout(() => window.location.reload(), 300);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [sessionId, router]);

  return null;
}
