import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const webhook = process.env.SUBSCRIBE_WEBHOOK_URL;
    const apiKey = process.env.SUBSCRIBE_API_KEY;

    if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ error: "upstream_error", detail: text }, { status: 502 });
      }
    } else {
      // No webhook configured — log for developers. In production, set SUBSCRIBE_WEBHOOK_URL.
      console.warn("[subscribe] SUBSCRIBE_WEBHOOK_URL not set — email:", email);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_payload", issues: err.issues }, { status: 400 });
    }
    console.error("/api/subscribe error", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
