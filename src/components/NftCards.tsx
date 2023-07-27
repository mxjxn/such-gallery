import Image from "next/image";
import React from "react";
import { XCircleIcon } from "@heroicons/react/24/solid";
import handleImageUrl from "@/lib/handleImageUrls";

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


export function NftPreviewCard({ data }) {
  const { image, name, contractAddress, tokenId } = data;
  const imageUrl = handleImageUrl(image);
  return (
    <div className="my-5 pt-5 py-2 px-2 flex flex-col xl:flex-row-reverse xs:items-center bg-slate-800 justify-between rounded-lg">
      <div className="p-2 w-full bg-black block-inline flex justify-around rounded-md">
        {image && <Image src={imageUrl} alt={name} width={256} height={256} />}
      </div>
      <div className="mt-2">
        {name && (
          <div className="text-xs p-1 mb-2 bg-zinc-900  overflow-hidden">
            <span className="pl-1 py-1 bg-zinc-800 block">
							{name}
						</span>
          </div>
        )}
        {!!contractAddress && (
          <div className="text-xs p-1 mt-2 bg-zinc-900  overflow-hidden">
            <span className="pl-1 py-1 bg-zinc-800 block">
              {contractAddress}/{tokenId}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const NftCard = ({
  title,
  imageURI,
  key,
  size = "sm",
  onDelete,
}: {
  title: string;
  imageURI: string;
  key?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  onDelete: () => Promise<void> | null;
}) => (
  <div className="max-w-xs m-2 bg-gradient-to-br from-stone-800 to-gray-800 rounded-lg flex justify-around py-2 border-4 border-slate-700 hover:from-stone-700 hover:to-gray-700">
    {title && imageURI && (
      <div
        className="flex flex-col items-center justify-around flex-wrap text-xs"
        key={key}
      >
        <div className="w-full flex justify-around px-4 py-2 m-0 bg-black">
          <NftImage src={imageURI} alt={title} size={size} />
        </div>
        <div className="mt-3 flex justify-between items-center px-3">
          <p className="px-3 inline">{title}</p>
          {!!onDelete && (
            <XCircleIcon
              className="text-red-500 w-4 h-4"
              onClick={() => {
                console.log({ title, imageURI });
                onDelete().then((x) => {
                  console.log(x);
                });
              }}
            />
          )}
        </div>
      </div>
    )}
  </div>
);

const NftListItem = ({
  title,
  imageURI,
  key,
  onDelete,
}: {
  title: string;
  imageURI: string;
  key?: string;
  onDelete: () => Promise<void> | null;
}) => (
  <div
    key={key}
    className="px-2 flex flex-row bg-gradient-to-r justify-between items-center from-slate-600 to-slate-700 p-1 gap-0 hover:from-slate-500 hover:to-slate-600 transition-colors"
  >
    <div>
      <NftImage src={imageURI} alt={title} size="xs" />
    </div>
    <div>{title}</div>
    {!!onDelete && (
      <XCircleIcon
        className="text-red-500 hover:text-red-400 active:text-red-300 w-6 h-6"
        onClick={() => {
          console.log({ title, imageURI });
          onDelete().then((x) => {
            console.log(x);
          });
        }}
      />
    )}
  </div>
);

export { NftListItem, NftCard }
