"use client";

import React from "react";
import { useValidateNftUrl } from "@/hooks/useValidateUrl";
import { Metadata, useNft } from "@/hooks/useNft";
import handleImageUrl from "@/lib/handleImageUrls";

// this is the page where users can submit an NFT.
// they can drop a URL that contains contractAddress and tokenId (such as opensea or etherscan)
// and it will be added to the database.

function Image({ src, alt }) {
  let imageUrl = handleImageUrl(src);

  return (
    <div className="p-3 bg-zinc-900 sm:w-full md:max-w-sm">
      <img src={imageUrl} alt={alt} className="max-w-xs" />
    </div>
  );
}

export default function SubmitArt() {
  // when the url is valid, the contractAddress and tokenUri are parsed, the submit button is enabled.
  const { setUrl, isUrlValid, nft } = useValidateNftUrl();

  // this next hook will fetch the onchain data for the NFT
  const { data, error } = useNft(nft);
  const metadata: Metadata = data?.metadata;
  const { attributes, name, description, image } = metadata || {};

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("handleSubmit");
  };

  return (
    <div className="p-3">
      <div>
        <form id="submit-art" action="/api/submit-art">
          <div className="m-5 px-10 py-2 text-doge-yellow">
            <label htmlFor="art-url">Art URL</label>
          </div>
          <div className="m-5 px-10 py-2 text-doge-white rounded-2xl">
            <input
              type="url"
              id="art-url"
              name="art-url"
              onChange={handleUrlChange}
              placeholder="Enter a Manifold, Zora, Opensea or Etherscan URL"
              className="input input-bordered w-full"
            />
          </div>
          <div className="p-3 flex items-center justify-between">
            <div className="max-w-sm">
              {metadata?.image && (
                <Image src={metadata.image} alt={metadata.name} />
              )}
            </div>
            <div className="">
              {name && <div className="p-2 m-2 bg-zinc-800">Name: {name}</div>}
              {description && (
                <div className="p-2 m-2 bg-zinc-800">
                  Description: {description}
                </div>
              )}
              {attributes && (
                <div className="m-2 py-2 bg-zinc-800">
                  {attributes.map((attribute, i) => (
                    <div key={i} className="p-2 ">
                      {attribute.trait_type}: {attribute.value}
                    </div>
                  ))}
                </div>
              )}
              {nft && (
                <div className="text-xs p-3 m-2 bg-zinc-900">
                  contract/id:
                  <span className="ml-2 bg-zinc-800">
                    {nft.contractAddress}/{nft.tokenId}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="mx-12 p-3 flex justify-end">
            <button
              disabled={!isUrlValid}
              onClick={handleSubmit}
              className="py-2 px-5 bg-gray-800 disabled:text-gray-400 border disabled:border-dashed border-gray-500"
              type="submit"
            >
              {isUrlValid ? "Save NFT for curation" : "enter an nft to save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
