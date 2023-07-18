"use client";

import React from "react";
import { useValidateNftUrl } from "@/hooks/useValidateUrl";
import { Metadata, useNft } from "@/hooks/useNft";

// this is the page where users can submit an NFT.
// they can drop a URL that contains contractAddress and tokenId (such as opensea or etherscan)
// and it will be added to the database.

export default function SubmitArt() {
  // when the url is valid, the contractAddress and tokenUri are parsed, the submit button is enabled.
  const { setUrl, isUrlValid, nft } = useValidateNftUrl();

  // this next hook will fetch the onchain data for the NFT
  const { data, error } = useNft(nft);
  const metadata: Metadata = data?.metadata;
  const { attributes, name, description } = metadata || {};

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.stopPropagation();
		console.log("handleSubmit");
  };

  return (
    <div className="bg-doge-yellow">
      <form id="submit-art" action="/api/submit-art">
        <div className="m-5 bg-doge-brown rounded-t-lg">
          <label htmlFor="art-url">Art URL</label>
        </div>
        <div className="p-2 bg-zinc-400">
          <input
            type="url"
            id="art-url"
            name="art-url"
            className="w-full"
            onChange={handleUrlChange}
          />
        </div>
      </form>
      {metadata?.image && (
        <div className="p-3 bg-zinc-900">
          <img src={metadata.image} className="max-w-xs" />
        </div>
      )}
      {nft && (
        <div className="text-xs p-2 m-2 bg-zinc-900">
          <span className="p-2 bg-zinc-800">
            {nft.contractAddress}/{nft.tokenId}
          </span>
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
      {name && <div className="p-2 m-2 bg-zinc-800">Name: {name}</div>}
      {description && (
        <div className="p-2 m-2 bg-zinc-800">Description: {description}</div>
      )}

      <div className="p-2 bg-zinc-700">
        <button
          disabled={!isUrlValid}
					onClick={handleSubmit}
          className="p-2 px-5 bg-gray-800 disabled:text-gray-400 border disabled:border-dashed border-gray-500"
          type="submit"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
