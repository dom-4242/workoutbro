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
    console.log(
      "📡 Athlete subscribed to channel:",
      getSessionChannel(sessionId),
    );

    channel.bind(PUSHER_EVENTS.ROUND_RELEASED, () => {
      console.log("📥 ROUND_RELEASED received");
      router.refresh();
    });

    channel.bind(PUSHER_EVENTS.ROUND_UPDATED, () => {
      console.log("📥 ROUND_UPDATED received");
      router.refresh();
    });

    channel.bind(PUSHER_EVENTS.ROUND_DELETED, () => {
      console.log("📥 ROUND_DELETED received");
      router.refresh();
    });

    channel.bind(PUSHER_EVENTS.SESSION_CANCELLED, () => {
      console.log("📥 SESSION_CANCELLED received");
      router.push("/dashboard");
    });

    channel.bind(PUSHER_EVENTS.SESSION_COMPLETED, () => {
      console.log("📥 SESSION_COMPLETED received");
      router.refresh();
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
    console.log(
      "📡 Trainer subscribed to channel:",
      getSessionChannel(sessionId),
    );

    channel.bind(PUSHER_EVENTS.ROUND_COMPLETED, () => {
      console.log("📥 ROUND_COMPLETED received");
      router.refresh();
    });

    channel.bind(PUSHER_EVENTS.SESSION_COMPLETED, () => {
      console.log("📥 SESSION_COMPLETED received");
      router.refresh();
    });

    channel.bind(PUSHER_EVENTS.SESSION_CANCELLED, () => {
      console.log("📥 SESSION_CANCELLED received");
      router.push("/dashboard");
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [sessionId, router]);

  return null;
}
