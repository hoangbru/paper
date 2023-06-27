import FriendRequests from "@/components/FriendRequests";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/libs/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC, useState } from "react";
import { toast } from "react-hot-toast";

const page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const incomingSenderIds = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
        const sender = (await fetchRedis("get", `user:${senderId}`)) as string;
        const senderParsed = JSON.parse(sender) as User
        return {
          senderId,
          senderEmail: senderParsed.email,
          senderName: senderParsed.name,
          senderImage: senderParsed.image,
        };
    })
  );
  return (
    <main className="pt-16 pl-4">
      <h1 className="font-bold text-3xl mb-8">Lời mời kết bạn</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests
          incomingFriendRequests={incomingFriendRequests}
          sessionId={session.user.id}
        />
      </div>
    </main>
  );
};

export default page;
