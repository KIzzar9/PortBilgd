// Cloudflare Pages Function: POST /api/contact
// Sends the service request to your Telegram.
// Required environment variables (Pages -> Settings -> Variables and Secrets):
//   TELEGRAM_BOT_TOKEN  (Secret)
//   TELEGRAM_CHAT_ID

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  // Honeypot: bots fill this hidden field, humans don't
  if (data.website) return new Response("ok");

  const clean = (v, n) => String(v || "").trim().slice(0, n);
  const name = clean(data.name, 100);
  const phone = clean(data.phone, 30);
  const email = clean(data.email, 100);
  const service = clean(data.service, 100);
  const message = clean(data.message, 1000);

  if (!name || !phone) {
    return new Response("Name and phone are required", { status: 400 });
  }

   if (!env.TELEGRAM_BOT_TOKEN) {
    return new Response("Missing TELEGRAM_BOT_TOKEN", { status: 500 });
  }
  if (!env.TELEGRAM_CHAT_ID) {
    return new Response("Missing TELEGRAM_CHAT_ID", { status: 500 });
  }
  const text =
    `🔔 Шинэ хүсэлт\n\n` +
    `Үйлчилгээ: ${service || "-"}\n` +
    `Нэр: ${name}\n` +
    `Утас: ${phone}\n` +
    `Имэйл: ${email || "-"}\n` +
    `Мессеж: ${message || "-"}`;

  const res = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text }),
    }
  );

  return new Response(res.ok ? "ok" : "Telegram error", {
    status: res.ok ? 200 : 502,
  });
}
