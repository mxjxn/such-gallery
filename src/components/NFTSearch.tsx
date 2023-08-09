import { comicNeue } from "@/fonts";
import React from "react";
import { validateUrl, parseUrl } from "@/lib/validNftUrl";
import CopyTextComponent from "@/components/CopyText";
import LabeledField from "@/components/LabeledField";
import NftActions from "@/components/NftActions";
import { Nft } from "@/types/types";
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
  const nftInput: Nft = parseUrl(inputValue);
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
      {nft?.token && !isError && (
        <div>
          <div className={` my-5 py-2 px-2  bg-slate-800 rounded-xl `}>
            <div
              className={`flex flex-col xl:flex-row-reverse xs:items-center justify-between`}
            >
              <div className="p-2 w-full bg-black block-inline flex justify-around rounded-md">
                <Image
                  src={handleImageUrl(nft.token.token.image.url)}
                  alt={nft.token.token.name}
                  width={256}
                  height={256}
                />
              </div>
              <div className="mt-3 xl:mt-0 xl:mr-3">
                <LabeledField inline label={"Name"}>
                  <div className="text-lg">{nft.token.token.name}</div>
                </LabeledField>
                <LabeledField inline label={"Creator"}>
                  {nft.token.token.metadata.created_by}
                </LabeledField>
                <LabeledField inline label={"Contract"} className="p-0 m-0">
                  <CopyTextComponent
                    text={nft.token.token.collectionAddress}
                    className="py-1"
                  />
                </LabeledField>
                <LabeledField inline label={"Token ID"}>
                  {nft.token.token.tokenId}
                </LabeledField>
              </div>
            </div>
            <div className={`w-full`}>
              <NftActions
                nft={zoraToSuchNft(nft.token)}
                onSave={() => {
                  if(!_.isNull(inputRef.current))
										inputRef.current.value = "";
										setInputValue("");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
