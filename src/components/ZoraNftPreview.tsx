import React from "react";
import { NftId } from "@/types/types";
import CopyTextComponent from "@/components/CopyText";
import LabeledField from "@/components/LabeledField";
import NftActions from "@/components/NftActions";
import Image from "next/image";
import { useNft } from "@/hooks/useNft";

export default async function ZoraNftPreview(
	{
		nft,
		onSave,
	}: {
		nft: NftId;
		onSave: () => void;
	}
) {
  const { data, isError } = useNft(nft);

  return (
		<div className={`text-3xl my-5 py-2 px-2 flex  xl:flex-row-reverse xs:items-center bg-slate-800 rounded-xl justify-around `} >
      {!!data &&
        data.contractAddress &&
        data.tokenId &&
        !isError &&
        !!data.imageURI && (
          <div>
            <div className={` my-5 py-2 px-2  bg-slate-800 rounded-xl `}>
              <div
                className={`flex flex-col xl:flex-row-reverse xs:items-center justify-between`}
              >
                <div className="p-2 w-full bg-black block-inline flex justify-around rounded-md">
                  <Image
                    src={data.imageURI}
                    alt={data.title || ""}
                    width={256}
                    height={256}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="mt-3 xl:mt-0 xl:mr-3">
                    <LabeledField inline label={"Name"}>
                      <div className="text-lg">{data.title}</div>
                    </LabeledField>
                    <LabeledField inline label={"Creator"}>
                      {data?.metadata?.created_by}
                    </LabeledField>
                    <LabeledField inline label={"Contract"} className="p-0 m-0">
                      <CopyTextComponent
                        text={data.contractAddress}
                        className="py-1"
                      />
                    </LabeledField>
                    <LabeledField inline label={"Token ID"}>
                      {data.tokenId}
                    </LabeledField>
                  </div>
                  <div className={`w-full`}>
                    <NftActions
                      nft={data}
                      onSave={onSave}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
