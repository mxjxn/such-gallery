import { useEffect, useState } from "react";
import { useContractRead } from "wagmi";
import nftABI from "@/abis/erc721abi";
import { Nft, Metadata } from "@/types/types";
import useSWR from "swr";
import { useQuery } from "@tanstack/react-query";
import handleImageUrl from "@/lib/handleImageUrls";

type TokenInformation = Nft | null;

async function tokenURIFetcher(url: string) {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // throw an exception if the request was not successful
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Fetch error: ${error}`);
    return null;
  }
}

export function useNft(tokenInfo: TokenInformation) {
  const [tokenURI, setTokenURI] = useState<string | null>(null);
  const {
    data: tokenURIData,
    isError: tokenURIError,
    isLoading: tokenURILoading,
  } = useContractRead({
    address: tokenInfo?.contractAddress,
    abi: nftABI,
    functionName: "tokenURI",
    args: [tokenInfo?.tokenId],
  });

  const { data: metadata, error: metadataError } = useQuery(
    ["tokenURI", tokenURI],
    () => tokenURIFetcher(tokenURI)
  );

  // set the TokenURI, based on URI type (ipfs, https)
  useEffect(() => {
    const str = tokenURIData as string;
    if (!!str && !tokenURIError) {
      setTokenURI(handleImageUrl(str));
    }
    if (tokenURIError) {
      console.error("Failed to fetch token URI");
    }
  }, [tokenURIData, tokenURIError]);

  return {
    data: { metadata, tokenURI },
    error: tokenURIError,
    loading: tokenURILoading,
  };
}
