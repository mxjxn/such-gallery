"use client";
import Image from "next/image";
import SubmitArt from "../components/SubmitArt";
import { useProfile } from "@/hooks/useProfile";
import { useEffect } from "react";
import NftList from "@/components/NftList";

export default function Home() {
  const { user } = useProfile();
  useEffect(() => {
    console.log("main page!", { user });
  }, [user]);
  return (
    <main className="">
      {user?.ethAddress && (
        <div className="w-full flex justify-around">
          <div className="w-1/2">
            <SubmitArt />
            <NftList address={user.ethAddress} />
          </div>
        </div>
      )}
      {/* Latest Chronological Submissions */}
      {/* Curate */}
      {/* Curated Galleries */}
      {/* Events */}
    </main>
  );
}
