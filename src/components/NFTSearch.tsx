import { comicNeue } from "@/fonts";
import React, { useEffect } from "react";
import { validateUrl, parseUrl } from "@/lib/validNftUrl";
import CopyTextComponent from "@/components/CopyText";
import LabeledField from "@/components/LabeledField";
import NftActions from "@/components/NftActions";
import { NftId } from "@/types/types";
import Image from "next/image";
import handleImageUrl from "@/lib/handleImageUrls";
import { useNft } from "@/hooks/useNft";
import _ from "lodash";
import { zoraToSuchNft } from "@/utils/zora";

export default function NFTSearch() {
  // a useRef for the input field
  const inputRef = React.useRef<HTMLInputElement>(null);
  // latest valid input value
  const [inputValue, setInputValue] = React.useState("");
  const nftInput: NftId = parseUrl(inputValue);
  // retrieve metadata from Zora API
  const { data: nft, isLoading, isEnabled, isError } = useNft(nftInput);

  const validateUrlOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (inputValue !== e.target.value && validateUrl(e.target.value)) {
      setInputValue(e.target.value);
    }
  };

  return (
    <div>
      <div className="w-full join group">
        <input
          ref={inputRef}
          onChange={validateUrlOnChange}
          className="input w-full border-secondary focus:border-white join-item"
          placeholder="Enter NFT URL or contract-address/token-id"
        />

        <button
          className={`
						join-item
						bg-secondary
						hover:bg-fuchsia-200
						hover:text-black
						active:bg-fuchsia-50
						border
						border-secondary
						group-focus:border-white
						text-white
						normal-case
						tracking-wider
						text-md
						${comicNeue.className}`}
        >
          Such NFT wow
        </button>
      </div>
      {isEnabled && isLoading && (
        <div
          className={`text-3xl my-5 py-2 px-2 flex  xl:flex-row-reverse xs:items-center bg-slate-800 rounded-xl justify-around `}
        >
          <div>Loading...</div>
        </div>
      )}
      {!!nft.contractAddress && !!nft.tokenId && !isError && !!nft.imageURI && (
        <div>
          <div className={` my-5 py-2 px-2  bg-slate-800 rounded-xl `}>
            <div
              className={`flex flex-col xl:flex-row-reverse xs:items-center justify-between`}
            >
              <div className="p-2 w-full bg-black block-inline flex justify-around rounded-md">
                <Image
                  src={nft.imageURI}
                  alt={nft.title || ""}
                  width={256}
                  height={256}
                />
              </div>
              <div className="flex flex-col">
                <div className="mt-3 xl:mt-0 xl:mr-3">
                  <LabeledField inline label={"Name"}>
                    <div className="text-lg">{nft.title}</div>
                  </LabeledField>
                  <LabeledField inline label={"Creator"}>
                    {nft?.metadata?.created_by}
                  </LabeledField>
                  <LabeledField inline label={"Contract"} className="p-0 m-0">
                    <CopyTextComponent
                      text={nft.contractAddress}
                      className="py-1"
                    />
                  </LabeledField>
                  <LabeledField inline label={"Token ID"}>
                    {nft.tokenId}
                  </LabeledField>
                </div>
                <div className={`w-full`}>
                  <NftActions
                    nft={nft}
                    onSave={() => {
                      if (!_.isNull(inputRef.current))
                        inputRef.current.value = "";
                      setInputValue("");
                    }}
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
