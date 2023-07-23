"use client";
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNftsByUser } from "@/app/nfts";
import Image from "next/image";

const { random, floor, pow } = Math;
const imageSizes = { xs: 30, sm: 60, md: 120, lg: 240, xl: 480, "2xl": 960 };

const scaledSize = (w: number, h: number, scale: number) => {
  const landscape = w > h;
  const scaledW = landscape ? scale : (scale * w) / h;
  const scaledH = landscape ? (scale * h) / w : scale;
  return [scaledW, scaledH];
};

function NftImage({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const width = imageSizes[size];
  const height = imageSizes[size];
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt + "- nft primary image"}
    />
  );
}

const NftCard = ({
  title,
  imageURI,
  key,
  size = "sm",
}: {
  title: string;
  imageURI: string;
  key?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) => (
  <div className="m-2  bg-gradient-to-br from-stone-800 to-gray-800 rounded-lg flex justify-around py-4 border-4 border-slate-700">
    {title && imageURI && (
      <div
        className="flex flex-col items-center justify-around flex-wrap text-xs"
        key={key}
      >
        <div className="w-full flex justify-around p-4 bg-black">
          <NftImage src={imageURI} alt={title} size={size} />
        </div>
        <p className="pt-4 px-10">{title}</p>
      </div>
    )}
  </div>
);

const NftListItem = ({
  title,
  imageURI,
  key,
}: {
  title: string;
  imageURI: string;
  key?: string;
}) => (
  <div key={key} className="flex flex-row gap-2 border border-b-slate-400">
    <div>
      <NftImage src={imageURI} alt={title} size="xs" />
    </div>
    <div>Title: {title}</div>
  </div>
);

export default function NftList({ address }) {
  const { data, isLoading } = useQuery(["userNfts", address], async () =>
    getNftsByUser(address)
  );
  return (
    <div>
      <div className="w-full flex flex-col justify-evenly flex-wrap gap-5 items-stretch bg-gradient-to-b to-gray-700 from-gray-800 text-gray-100 border border-slate-400 rounded-2xl pt-4 my-8">
        <p className="text-2xl text-center w-full">Saved NFTs</p>
        {!!data &&
          data.map((nft) => (
            <NftListItem
              key={`${nft?.title}_${floor(random() * pow(2, 11))}`}
              imageURI={nft?.imageURI || ""}
              title={nft?.title || "Missing title"}
            />
          ))}
      </div>
      <div className="w-full flex flex-row justify-evenly flex-wrap gap-5 items-stretch bg-gradient-to-b to-gray-700 from-gray-800 text-gray-100 border border-slate-400 rounded-2xl pt-4 my-8">
        {!!data &&
          data.map((nft) => (
            <NftCard
              key={`${nft?.title}_${floor(random() * pow(2, 11))}`}
              imageURI={nft?.imageURI || ""}
              title={nft?.title || "Missing title"}
              size="md"
            />
          ))}
      </div>
    </div>
  );
}
