"use client";

import React, { useEffect, useState } from "react";
import { comicNeue } from "@/fonts";
import { useValidateNftUrl } from "@/hooks/useValidateUrl";
import { Metadata, useNft } from "@/hooks/useNft";
import handleImageUrl from "@/lib/handleImageUrls";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addNftToUser, getNftsByUser } from "@/app/nfts";
import { useProfile } from "@/hooks/useProfile";
import { Prisma } from "@prisma/client";

// this is the page where users can submit an NFT.
// they can drop a URL that contains contractAddress and tokenId (such as opensea or etherscan)
// and it will be added to the database.

function Image({ src, alt }) {
  let imageUrl = handleImageUrl(src);
  return (
    <img
      src={imageUrl}
      alt={alt}
      className="xs:w-1/2 sm:w-36 md:w-48 lg:w-72"
    />
  );
}

export default function SubmitArt() {
  // when the url is valid, the contractAddress and tokenUri are parsed, the submit button is enabled.
  const { setUrl, url, isUrlValid, nft } = useValidateNftUrl();
	const queryClient = useQueryClient()

  // this next hook will fetch the onchain data for the NFT
  const { address } = useProfile();
  const { data, error, loading } = useNft(nft);
  const [fresh, setFresh] = useState(false);
  const metadata: Metadata = data?.metadata;
  const { attributes, name, description, image } = metadata || {};

  const mutation = useMutation({
    mutationFn: (newNft: any) => {
      console.log({ newNft });
      return addNftToUser(address, newNft);
    },
		onSuccess: (a: any) => {
			queryClient.invalidateQueries({queryKey: ["userNfts", address]})
		}
  });

  useEffect(() => {
    if (!fresh && isUrlValid && !loading) setFresh(true);
  }, [name, fresh]);

  useEffect(() => {
    console.log({ nft });
  }, [nft]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value !== url) {
      setFresh(false);
    }
    setUrl(e.target.value);
    console.log({
      isUrlValid,
      val: e.target.value,
    });
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const { contractAddress, tokenId } = nft;
    e.preventDefault();
    e.stopPropagation();
    console.log({
      nft,
      data,
    });
    mutation.mutate({
      tokenId,
      contractAddress,
      metadataURI: handleImageUrl(data?.tokenURI),
      imageURI: handleImageUrl(data?.metadata?.image),
			title: data?.metadata?.name,
			description: data?.metadata?.description,
    });
    console.log("handleSubmit");
  };

  return (
    <div className="m-3 rounded-3xl">
      <div className="text-xs">
        <form id="submit-art" action="/api/submit-art">
          <div className="mx-5 px-10 pt-10 text-doge-yellow">
            <label
              className={`${comicNeue.className} pl-4 underline underline-offset-8 font-bold text-lg`}
              htmlFor="art-url"
            >
              Art URL
            </label>
          </div>
          <div className="mx-5 px-10 py-2 text-doge-white rounded-2xl">
            <input
              type="url"
              id="art-url"
              name="art-url"
              onChange={handleUrlChange}
              placeholder="Enter a Manifold, Zora, Opensea or Etherscan URL"
              className="input input-bordered w-full"
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

          {fresh && (
            <div className="my-5 pt-5 py-2 px-14 flex flex-col md:flex-row-reverse xs:items-center bg-slate-800 justify-between">
              <div className="rounded-xl w-full flex justify-center p-5">
                {metadata?.image && (
                  <Image src={metadata.image} alt={metadata.name} />
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
