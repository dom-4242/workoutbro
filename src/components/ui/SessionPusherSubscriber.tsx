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
    console.log("🚀 ATHLETE SUBSCRIBER MOUNTED for session:", sessionId);
    const channel = pusherClient.subscribe(getSessionChannel(sessionId));

    channel.bind(PUSHER_EVENTS.ROUND_RELEASED, () => {
      console.log("📥 ROUND_RELEASED received");
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.ROUND_UPDATED, () => {
      console.log("📥 ROUND_UPDATED received");
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.ROUND_DELETED, () => {
      console.log("📥 ROUND_DELETED received");
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.ROUND_COMPLETED, () => {
      console.log("📥 ROUND_COMPLETED received (Athlete)");
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.SESSION_CANCELLED, () => {
      console.log("📥 SESSION_CANCELLED received");
      router.push("/dashboard");
    });

    channel.bind(PUSHER_EVENTS.SESSION_COMPLETED, () => {
      console.log("📥 SESSION_COMPLETED received");
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
    console.log("🚀 TRAINER SUBSCRIBER MOUNTED for session:", sessionId);
    const channel = pusherClient.subscribe(getSessionChannel(sessionId));

    channel.bind(PUSHER_EVENTS.ROUND_RELEASED, () => {
      console.log("📥 ROUND_RELEASED received (Trainer)");
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.ROUND_UPDATED, () => {
      console.log("📥 ROUND_UPDATED received");
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.ROUND_COMPLETED, () => {
      console.log("📥 ROUND_COMPLETED received");
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.SESSION_COMPLETED, () => {
      console.log("📥 SESSION_COMPLETED received");
      setTimeout(() => window.location.reload(), 300);
    });

    channel.bind(PUSHER_EVENTS.SESSION_CANCELLED, () => {
      console.log("📥 SESSION_CANCELLED received");
      router.push("/dashboard");
    });

    channel.bind("round-saved", () => {
      console.log("📥 ROUND_SAVED received (DRAFT)");
      setTimeout(() => window.location.reload(), 300);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [sessionId, router]);

  return null;
}
