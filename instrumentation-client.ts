import { initBotId } from "botid/client/core";

// BotID's challenge script is only served by Vercel's routing, which plain
// `next dev` doesn't have - initializing it there hangs protected fetches.
// It's always inert in production anyway (checkBotId() -> isBot: false in dev),
// so skipping the client init in dev loses no protection and keeps `npm run dev` usable.
if (process.env.NODE_ENV === "production") {
  initBotId({
    protect: [
      {
        path: "/api/contact",
        method: "POST",
      },
    ],
  });
}
