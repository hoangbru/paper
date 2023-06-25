import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/libs/auth";
import { db } from "@/libs/db";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Không được ủy quyền", { status: 401 });
    }

    // verify both users are not already friends
    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    );
    if (isAlreadyFriends) return new Response("Đã kết bạn", { status: 400 });

    const hasFriendRequests = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd
    );
    if (!hasFriendRequests)
      return new Response("Không có yêu cầu kết bạn nào", { status: 400 });

    await db.sadd(`user:${session.user.id}:friends`, idToAdd);
    await db.sadd(`user:${idToAdd}:friends`, session.user.id);
    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd);

    return new Response("Thành công");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Dữ liệu yêu cầu không hợp lệ", { status: 422 });
    }
    return new Response("Yêu cầu không hợp lệ", { status: 400 });
  }
}
