import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/libs/auth";
import { db } from "@/libs/db";
import { pusherServer } from "@/libs/pusher";
import { toPusherKey } from "@/libs/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Lỗi xác thực", { status: 401 });
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

    const [userRaw, friendRaw] = (await Promise.all([
      fetchRedis("get", `user:${session.user.id}`),
      fetchRedis("get", `user:${idToAdd}`),
    ])) as [string, string];

    const user = JSON.parse(userRaw) as User;
    const friend = JSON.parse(friendRaw) as User;
    // notify added

    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${idToAdd}:friends`),
        "new_friend",
        user
      ),
      pusherServer.trigger(
        toPusherKey(`user:${session.user.id}:friends`),
        "new_friend",
        friend
      ),

      db.sadd(`user:${session.user.id}:friends`, idToAdd),
      db.sadd(`user:${idToAdd}:friends`, session.user.id),
      db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd),
    ]);

    return new Response("Thành công");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Dữ liệu yêu cầu không hợp lệ", { status: 422 });
    }
    return new Response("Yêu cầu không hợp lệ", { status: 400 });
  }
}
