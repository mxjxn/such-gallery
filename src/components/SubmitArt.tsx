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

// this is the page where users can submit an NFT.
// they can drop a URL that contains contractAddress and tokenId (such as opensea or etherscan)
// and it will be added to the database.

// const Img = ({ src, alt }) => <img src={handleImageUrl(src)} alt={alt} className="xs:w-1/2 sm:w-36 md:w-48 lg:w-72" />;

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
            <div className="my-5 pt-5 py-2 px-14 flex flex-col md:flex-row-reverse xs:items-center bg-slate-800 justify-between">
              <div className="rounded-xl w-full flex justify-center p-5">
                {metadata?.image && (
                  <Image
                    src={handleImageUrl(metadata.image)}
                    alt={metadata.name}
                    width={128}
                    height={128}
                  />
                )}
              </div>
              <div className=" mt-5">
                {name && (
                  <div className="p-2 m-2 bg-zinc-800">Name: {name}</div>
                )}
                {/*
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
								*/}
                {nft && (
                  <div className="text-xs p-3 m-2 bg-zinc-900  overflow-hidden">
                    contract/id:
                    <span className="ml-2 bg-zinc-800">
                      {nft.contractAddress}/{nft.tokenId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
