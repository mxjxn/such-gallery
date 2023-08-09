import { endpoint, networks } from "@/utils/zora"
import { Nft } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { ZDK } from "@zoralabs/zdk";

async function getNft(nft: Nft): Promise<any> {
  const zdk = new ZDK({ networks, endpoint });
  return await zdk.sdk.token({
    network: networks[0],
    token: {
      address: nft.contractAddress,
      tokenId: nft.tokenId,
    },
    includeFullDetails: true,
  });
}

export function useNft(nft: Nft) {
	const { contractAddress, tokenId, chain = "1" } = nft;

  const enabled = !!contractAddress && !!tokenId;

  const { data, isLoading, isError } = useQuery(
    ["nft", [chain, contractAddress, tokenId]],
    () => getNft(nft),
    {
      enabled,
      onError: (error) => {
        console.log("error dude", error);
      },
      onSuccess: (data) => {
        console.log("cool dude", data);
      },
    }
  );

  return {
    data,
		isEnabled: enabled,
    isError,
    isLoading,
  };
}
