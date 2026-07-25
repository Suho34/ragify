import { Liveblocks } from "@liveblocks/node";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  const { room } = await request.json();

  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user) {
    const lbSession = liveblocks.prepareSession(session.user.id, {
      userInfo: {
        name: session.user.name ?? "Unknown",
        avatarUrl: session.user.image ?? null,
      },
    });
    lbSession.allow(room, lbSession.FULL_ACCESS);
    const { body, status } = await lbSession.authorize();
    return new Response(body, { status });
  }

  const guestId = `guest-${crypto.randomUUID()}`;
  const lbSession = liveblocks.prepareSession(guestId, {
    userInfo: {
      name: "Guest",
      avatarUrl: null,
    },
  });
  lbSession.allow(room, lbSession.FULL_ACCESS);
  const { body, status } = await lbSession.authorize();
  return new Response(body, { status });
}
