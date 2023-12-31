import { Icon, Icons } from "@/components/Icons";
import SignOutButton from "@/components/SignOutButton";
import { authOptions } from "@/libs/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, ReactNode, useState } from "react";
import FriendRequestSidebarOptions from "@/components/FriendRequestSidebarOptions";
import { fetchRedis } from "@/helpers/redis";
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import SidebarChatList from "@/components/SidebarChatList";
import MobileChatLayout from "@/components/MobileChatLayout";
import { SidebarOption } from "@/types/typings";
import { toast } from "react-hot-toast";

interface LayoutProps {
  children: ReactNode;
}

// Done after the video and optional: add page metadata
export const metadata = {
  title: "Paper",
};

const sidebarOptions: SidebarOption[] = [
  {
    id: 1,
    name: "Thêm bạn mới",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
];

const Layout = async ({ children }: LayoutProps) => {
    const session = await getServerSession(authOptions);
    if (!session) notFound();

    const friends = await getFriendsByUserId(session.user.id);

    const unseenRequestCount = (
      (await fetchRedis(
        "smembers",
        `user:${session.user.id}:incoming_friend_requests`
      )) as User[]
    ).length;

  return (
    <div className="w-full flex h-screen">
      <div className="md:hidden">
        <MobileChatLayout
          friends={friends}
          session={session}
          sidebarOptions={sidebarOptions}
          unseenRequestCount={unseenRequestCount}
        />
      </div>
      <div className="hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
        <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
          {/* <Icons.Logo className="h-8 w-auto text-gray-600" /> */}
          <Image
            referrerPolicy="no-referrer"
            alt="logo"
            src="/images/logo-black.png"
            width={20}
            height={20}
            className="py-2 h-12 w-auto text-gray-600 order-1"
          />
        </Link>

        {friends.length > 0 ? (
          <div className="text-base font-semibold leading-6 text-gray-400">
            Bạn bè
          </div>
        ) : null}

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <SidebarChatList sessionId={session.user.id} friends={friends} />
            </li>
            <li>
              <div className="text-base font-semibold leading-6 text-gray-400">
                Tổng quan
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {sidebarOptions.map((option) => {
                  const Icon = Icons[option.Icon];
                  return (
                    <li key={option.id}>
                      <Link
                        href={option.href}
                        className="text-gray-700 hover:text-gray-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm"
                      >
                        <span className="text-gray-400 border-gray-200 group-hover:border-gray-600 group-hover:text-gray-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                          <Icon className="h-4 w-4" />
                        </span>

                        <span className="truncate">{option.name}</span>
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <FriendRequestSidebarOptions
                    sessionId={session.user.id}
                    initialUnseenRequestCount={unseenRequestCount}
                  />
                </li>
              </ul>
            </li>

            <li className="-mx-6 mt-auto flex items-center">
              <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                <div className="relative h-8 w-8 bg-gray-50">
                  <Image
                    fill
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    src={session.user.image || ""}
                    alt="Your profile picture"
                  />
                </div>

                <span className="sr-only">Your profile</span>
                <div className="flex flex-col">
                  <p
                    aria-hidden="true"
                    className="text-ellipsis overflow-hidden"
                  >
                    {session.user.name}
                  </p>
                  <span className="text-xs text-zinc-400" aria-hidden="true">
                    {session.user.email}
                  </span>
                </div>
              </div>

              <SignOutButton className="h-full aspect-square" />
            </li>
          </ul>
        </nav>
      </div>
      <aside className="max-h-screen container py-16 md:py-2 w-full">
        {children}
      </aside>
    </div>
  );
};

export default Layout;
