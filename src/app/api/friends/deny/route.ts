import { authOptions } from "@/libs/auth";
import { getServerSession } from "next-auth";
import { db } from "@/libs/db";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);
    const { id: idToDeny } = z.object({ id: z.string() }).parse(body);
    if (!session) {
      return new Response("Không được ủy quyền", { status: 401 });
    }

    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny);

    return new Response("Thành công");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Dữ liệu yêu cầu không hợp lệ", { status: 422 });
    }
    return new Response("Yêu cầu không hợp lệ", { status: 400 });
  }
}
