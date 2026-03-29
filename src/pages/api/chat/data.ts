import type { APIRoute } from "astro";
import { isAuth } from "@/lib/isAuth";
import pb from "@/client";
import { getDashboardData } from "@/lib/data/dashboard";
import type { TypedPocketBase } from "@/pocketbase-types";

const CHAT_SECRET_KEY = import.meta.env.CHAT_SECRET ?? "pm-chat-default-key";

async function generateChatSecret(userId: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(CHAT_SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(userId));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuth(cookies)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  pb.authStore.loadFromCookie(cookies.get("pb_auth")?.value || "");
  const typedPb = pb as unknown as TypedPocketBase;
  const userId = pb.authStore.model?.id;

  if (!userId) {
    return new Response(JSON.stringify({ error: "No user session" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const year = new Date().getFullYear();
    const data = await getDashboardData(typedPb, year);
    const chatSecret = await generateChatSecret(userId);

    return new Response(
      JSON.stringify({ data, chatSecret, timestamp: Date.now() }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[chat/data] Error fetching data:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
