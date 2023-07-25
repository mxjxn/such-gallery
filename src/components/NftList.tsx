"use client";
import React, { useEffect } from "react";
import _ from "lodash";
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
  <div className="max-w-xs m-2  bg-gradient-to-br from-stone-800 to-gray-800 rounded-lg flex justify-around py-2 border-4 border-slate-700 hover:from-stone-700 hover:to-gray-700">
    {title && imageURI && (
      <div
        className="flex flex-col items-center justify-around flex-wrap text-xs"
        key={key}
      >
        <div className="w-full flex justify-around px-4 py-2 m-0 bg-black">
          <NftImage src={imageURI} alt={title} size={size} />
        </div>
        <p className="w-full pt-4 px-3">{title}</p>
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
  <div
    key={key}
    className="flex flex-row bg-gradient-to-r from-slate-600 to-slate-700 p-1 gap-0 hover:from-slate-500 hover:to-slate-600 transition-colors"
  >
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
  const [cardView, setCardView] = React.useState(false);
  return (
    <div>
      {!_.isEmpty(data) && (
        <div className="animate-fadeIn w-full bg-gradient-to-b to-gray-900 from-gray-800 text-gray-100 border border-slate-400 my-8 rounded-2xl pt-4 px-4">
          <div className="w-full pb-0 flex flex-row items-center flex-row justify-between justify-items-start">
            <p className="text-2xl text-center">Saved NFTs</p>
            <div className="cursor-pointer label inline-block py-4 flex items-center">
              <span className="label-text p-5">
                {cardView ? "Card" : "List"} View
              </span>

              <input
                type="checkbox"
                className="toggle toggle-primary"
                onChange={(e) => {
                  if (e.target.checked) {
                    setCardView(true);
                  } else {
                    setCardView(false);
                  }
                }}
              />
            </div>
          </div>
          <div className=" rounded-2xl border-4 border-slate-800 p-2 mb-4">
            {!cardView ? (
              <div className="w-full flex flex-col justify-evenly flex-wrap gap-1 items-stretch p-5">
                {!!data &&
                  data.map((nft) => (
                    <NftListItem
                      key={`${nft?.title}_${floor(random() * pow(2, 11))}`}
                      imageURI={nft?.imageURI || ""}
                      title={nft?.title || "Missing title"}
                    />
                  ))}
              </div>
            ) : (
              <div className="w-full flex flex-row justify-between flex-wrap items-stretch">
                {!!data &&
                  data.map((nft) => (
                    <NftCard
                      key={`${nft?.title}_${floor(random() * pow(2, 11))}`}
                      imageURI={nft?.imageURI || ""}
                      title={nft?.title || "Missing title"}
                      size="sm"
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
