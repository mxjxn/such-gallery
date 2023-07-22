"use client";
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNftsByUser } from "@/app/nfts";
import Image from "next/image";

const Nft = ({ data }) => {
  return (
    <div className="w-48 bg-gradient-to-br from-stone-800 to-gray-800 rounded-lg p-4">
      {data && data.title && data.imageURI && (
        <>
          <Image src={data.imageURI} height={48} width={48} />
          <p>{data.title}</p>
        </>
      )}
    </div>
  );
};

export default function NftList({ address }) {
  const { data, isLoading } = useQuery(["userNfts", address], async () =>
    getNftsByUser(address)
  );
  useEffect(() => {
    console.log({ data });
  }, [data]);
  return (
    <div className="w-full flex flex-row gap-5 bg-gradient-to-b to-gray-950 from-gray-900 text-gray-100">
      {!!data && data.map((nft) => <Nft data={nft} />)}
    </div>
  );
}
