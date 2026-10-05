"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

const enabled = Boolean(key && !key.includes("PLACEHOLDER"));

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!enabled) return;
    posthog.init(key as string, {
      api_host: host,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
  }, []);

  if (!enabled) return <>{children}</>;
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
