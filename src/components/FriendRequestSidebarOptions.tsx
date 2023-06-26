"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";

interface FriendRequestSidebarOptionsProps {
  sessionId: string;
  initialUnseenRequestCount: number;
}

const FriendRequestSidebarOptions: FC<FriendRequestSidebarOptionsProps> = ({
  sessionId,
  initialUnseenRequestCount,
}) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    initialUnseenRequestCount
  );
  return (
    <Link
      href="/dashboard/requests"
      className="text-gray-700 hover:text-gray-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm"
    >
      <div className="text-gray-400 border-gray-200 group-hover:border-gray-600 group-hover:text-gray-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <User className="h-4 w-4" />
      </div>
      <p className="truncate">Lời mời kết bạn</p>
      {unseenRequestCount > 0 ? (
        <div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-red-600">
          {unseenRequestCount}
        </div>
      ) : null}
    </Link>
  );
};

export default FriendRequestSidebarOptions;
