"use client";

import { FC, useEffect, useState } from "react";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { pusherClient } from "@/libs/pusher";
import { toPusherKey } from "@/libs/utils";
import { toast } from "react-hot-toast";
import Button from "./ui/Button";

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  sessionId,
}) => {
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );
  const [isLoadingAccept, setIsLoadingAccept] = useState<boolean>(false);
  const [isLoadingDeny, setIsLoadingDeny] = useState<boolean>(false);

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );

    const friendRequestHandler = ({
      senderId,
      senderEmail,
      senderName,
      senderImage,
    }: IncomingFriendRequest) => {
      setFriendRequests((prev) => [
        ...prev,
        { senderId, senderEmail, senderName, senderImage },
      ]);
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);

  const acceptFriend = async (senderId: string) => {
    setIsLoadingAccept(true);
    try {
      await axios.post("/api/friends/accept", { id: senderId });
      setFriendRequests((prev) =>
        prev.filter((request) => request.senderId !== senderId)
      );
      router.refresh();
    } catch (error) {
      toast.error("Đã có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setIsLoadingAccept(false);
    }
  };

  const denyFriend = async (senderId: string) => {
    setIsLoadingDeny(true);
    try {
      await axios.post("/api/friends/deny", { id: senderId });

      setFriendRequests((prev) =>
        prev.filter((request) => request.senderId !== senderId)
      );

      router.refresh();
    } catch (error) {
      toast.error("Đã có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setIsLoadingDeny(false);
    }
  };
  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Không có lời mời nào được hiển thị...
        </p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black hidden" />
            <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
              <div className="relative h-8 w-8 bg-gray-50">
                <Image
                  fill
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                  src={request.senderImage || ""}
                  alt="Your profile picture"
                />
              </div>

              <div className="flex flex-col">
                <p className="font-semibold text-lg">{request.senderName}</p>
                <span className="text-xs text-zinc-400" aria-hidden="true">
                  {request.senderEmail}
                </span>
              </div>
            </div>
            {/* <p className='font-medium text-lg'>{request.senderEmail}</p> */}
            {!isLoadingAccept ? (
              <button
                onClick={() => acceptFriend(request.senderId)}
                aria-label="accept friend"
                className="w-8 h-8 bg-green-600 hover:bg-green-700 grid place-items-center rounded-full transition hover:shadow-md"
              >
                <Check className="font-semibold text-white w-3/4 h-3/4" />
              </button>
            ) : (
              <Button variant="ghost" isLoading={isLoadingAccept}></Button>
            )}

            {!isLoadingDeny ? (
              <button
                onClick={() => denyFriend(request.senderId)}
                aria-label="deny friend"
                className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
              >
                <X className="font-semibold text-white w-3/4 h-3/4" />
              </button>
            ) : (
              <Button variant="ghost" isLoading={isLoadingDeny}></Button>
            )}
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
