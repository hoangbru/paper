import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/libs/auth";
import { db } from "@/libs/db";
import { pusherServer } from "@/libs/pusher";
import { toPusherKey } from "@/libs/utils";
import { addFriendValidator } from "@/libs/validators/add-friend";
import { getServerSession } from "next-auth";
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`) as string;


    if (!idToAdd) {
      return new Response("Nguời dùng không tồn tại!", { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Lỗi xác thực", { status: 401 });
    }

    if (idToAdd === session.user.id) {
      return new Response("Bạn không thể thêm bản thân vào danh sách bạn bè!", {
        status: 400,
      });
    }

    // check if user already added
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Người này đã được thêm vào danh sách yêu cầu", { status: 400 });
    }

    // check if the user already has friends
    const isAlreadyFriends = (await fetchRedis(
        "sismember",
        `user:${session.user.id}:friends`,
        idToAdd
      )) as 0 | 1;
  
      if (isAlreadyFriends) {
        return new Response("Các bạn đã là bạn bè", { status: 400 });
      }

    //   valid request, send friend request

    pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`), 
      'incoming_friend_requests',
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
        senderName: session.user.name,
        senderImage: session.user.image,
      }
    )

    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)
    return new Response('Thành công')

  } catch (error) {
    if(error instanceof z.ZodError) {
        return new Response('Dữ liệu yêu cầu không hợp lệ', {status: 422})
    }
    return new Response('Yêu cầu không hợp lệ', {status:400})
  }
}
