"use client";
import Image from "next/image";
import { useProfile } from "@/hooks/useProfile";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import SubmitArt from "@/components/SubmitArt";
import UserNftList from "@/components/UserNftList";
import UserCuratedLists from "@/components/UserCuratedLists";

export default function Home() {
  const { user } = useProfile();
  const { isDisconnected } = useAccount();
  return (
    <main className="">
      {!isDisconnected && user?.ethAddress && (
        <div className="w-full flex justify-around">
          <div className="w-1/2">
            <SubmitArt />
            <UserNftList address={user.ethAddress} />
						<UserCuratedLists />
          </div>
        </div>
      )}

      {/* Latest Chronological Submissions */}
      {/* Curated Galleries */}
      {/* Events */}
    </main>
  );
}
