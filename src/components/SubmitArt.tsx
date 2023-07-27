"use client";

import React, { useState } from "react";
import { comicNeue } from "@/fonts";
import { Metadata, useNft } from "@/hooks/useNft";
import handleImageUrl from "@/lib/handleImageUrls";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addNftToUser } from "@/app/nfts";
import { useProfile } from "@/hooks/useProfile";
import Image from "next/image";
import { validUrlParser } from "@/lib/validNftUrl";
import { NftPreviewCard } from "./NftCards";

export default function SubmitArt() {
  // when the url is valid, the contractAddress and tokenUri are parsed, the submit button is enabled.
  const [url, setUrl] = useState("");
  const [isUrlValid, nft] = validUrlParser(url);
  const queryClient = useQueryClient();

  // this next hook will fetch the onchain data for the NFT
  const { address } = useProfile();
  const { data, error, loading } = useNft(nft);
  const metadata: Metadata = data?.metadata;
  const { name } = metadata || {};

  const mutation = useMutation({
    mutationFn: (newNft: any) => addNftToUser(address, newNft),
    onSuccess: (a: any) => {
      queryClient.invalidateQueries({ queryKey: ["userNfts", address] });
      setUrl("");
    },
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const { contractAddress, tokenId } = nft;
    e.preventDefault();
    mutation.mutate({
      tokenId,
      contractAddress,
      metadataURI: handleImageUrl(data?.tokenURI),
      imageURI: handleImageUrl(data?.metadata?.image),
      title: data?.metadata?.name,
      description: data?.metadata?.description,
    });
  };

  return (
    <div className="m-3 rounded-3xl">
      <div className="text-xl">Add an artwork to your collection</div>
      <div className="text-xs">
        <form id="submit-art" action="/api/submit-art">
          <div className="mx-5 pt-10 text-doge-yellow">
            <label
              className={`${comicNeue.className} pl-4 underline underline-offset-8 font-bold text-lg`}
              htmlFor="art-url"
            >
              Art URL
            </label>
          </div>

          <div className="mx-5 py-2 text-doge-white rounded-2xl">
            <input
              type="url"
              id="art-url"
              name="art-url"
              onChange={handleUrlChange}
              placeholder="Enter a Manifold, Zora, Opensea or Etherscan URL"
              className="block input input-bordered w-full"
            />
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

          {isUrlValid && metadata && (
						<NftPreviewCard data={{ ...metadata, ...nft }} />
          )}
        </form>
      </div>
    </div>
  );
}
