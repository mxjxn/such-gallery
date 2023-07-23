"use client";
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNftsByUser } from "@/app/nfts";
import Image from "next/image";

const { random, floor, pow } = Math;
const NftCard = ({
  title,
  imageURI,
  key,
}: {
  title: string;
  imageURI: string;
  key?: string;
}) => {
  return (
    <div className="m-2  bg-gradient-to-br from-stone-800 to-gray-800 rounded-lg flex justify-around py-4 border-4 border-slate-700">
      {title && imageURI && (
        <div
          className="flex flex-col items-center justify-around flex-wrap text-xs"
          key={key}
        >
          <div className="w-full flex justify-around p-4 bg-black">
            <NftImage src={imageURI} alt={title} />
          </div>
          <p className="pt-4">{title}</p>
        </div>
      )}
    </div>
  );
};

const NftImage = ({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) => {
  return (
    <Image
      src={src}
      height={120}
      width={120}
      alt={alt + "- nft primary image"}
    />
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
    <div className="w-full flex flex-row justify-evenly flex-wrap gap-5 items-stretch bg-gradient-to-b to-gray-700 from-gray-800 text-gray-100 border border-slate-400 rounded-2xl pt-4 my-8">
      {!!data &&
        data.map((nft) => (
          <NftCard
            key={`${nft?.title}_${floor(random() * pow(2, 11))}`}
            imageURI={nft?.imageURI || ""}
            title={nft?.title || "Missing title"}
          />
        ))}
    </div>
  );
}
