import { useEffect, useState } from "react";
import { useContractRead } from "wagmi";
import nftABI from "@/abis/erc721abi";
import { Nft } from "@/types/types";
import useSWR from "swr";

type TokenInformation = Nft | null;

async function tokenURIFetcher(url: string) {
  if (!url) return null;
  console.log("fetching metadata", url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // throw an exception if the request was not successful
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("data", data);
    return data;
  } catch (error) {
    console.error(`Fetch error: ${error}`);
    return null;
  }
}

export type Metadata = {
  name?: string;
  description?: string;
  image?: string;
  image_details?: any;
  image_url?: string;
  created_by?: string;
  attributes?: Array<any>;
};

export function useNft(tokenInfo: TokenInformation) {
  // get tokenURI from contract
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

  // get metadata from tokenURI
  const { data: metadata, error: metadataError } = useSWR(
    () => tokenURI,
    tokenURIFetcher
  );

	// set the TokenURI, based on URI type (ipfs, https)
  useEffect(() => {
    const str = tokenURIData as string;
    console.log({ tokenURIData, tokenURIError });
    if (!!str && !tokenURIError) {
      if (str.split(":")[0] === "https") {
        console.log({ https: str });
        setTokenURI(tokenURIData as string);
      } else if (str.split(":")[0] === "ipfs") {
        const cid: string = str.split(":")[1];
        setTokenURI(`https://ipfs.io/ipfs/${cid}`);
      }
      console.log("setting tokenURI");
    }
    if (tokenURIError) {
      console.error("Failed to fetch token URI");
    }
  }, [tokenURIData, tokenURIError]);

  return {
    data: { metadata, tokenURI },
    error: tokenURIError,
    tokenURILoading,
  };
}
