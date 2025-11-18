import React from "react";
import Image from "next/image"

export async function NftPreviewCard({ image, name, collectionAddress, tokenId }: { image: string; name: string; collectionAddress: string; tokenId: string; }){
  // const { image, name, contractAddress, tokenId, } = data;
  return ( 
	<div>
    <div className="my-5 pt-5 py-2 px-2 flex flex-col xl:flex-row-reverse xs:items-center bg-slate-800 justify-between rounded-lg">
      <div className="p-2 w-full bg-black block-inline flex justify-around rounded-md">
        {image && <Image src={image} alt={name} width={256} height={256} />}
      </div>
      <div className="mt-2">
        {name && (
          <div className="text-xs p-1 mb-2 bg-zinc-900  overflow-hidden">
            <span className="pl-1 py-1 bg-zinc-800 block">{name}</span>
          </div>
        )}
				{!!collectionAddress && !!tokenId && (
          <div className="text-xs p-1 mt-2 bg-zinc-900  overflow-hidden">
            <span className="pl-1 py-1 bg-zinc-800 block">
              {collectionAddress}/{tokenId}
            </span>
          </div>
        )}
      </div>
    </div>
	</div>
  );
}

