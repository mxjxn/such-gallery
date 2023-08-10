import { endpoint, networks } from "@/utils/zora";
import { Nft } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { ZDK } from "@zoralabs/zdk";

async function getNft(nft: Nft, includeFullDetails: boolean): Promise<any> {
  const zdk = new ZDK({ networks, endpoint });
  return await zdk.sdk.token({
    network: networks[0],
    token: {
      address: nft.contractAddress,
      tokenId: nft.tokenId,
    },
    includeFullDetails,
  });
}

export function useNft(nft: Nft) {
  const { contractAddress = "", tokenId = "", chain = "1" } = nft || {};
  const { data, isLoading, isError } = useQuery(
    ["nft", [chain, contractAddress, tokenId]],
    () => getNft(nft, true),
    {
      enabled: !!contractAddress && !!tokenId,
      onError: (error) => {
        console.error("error at zora getToken call", error);
      },
      onSuccess: (data) => {
      },
    }
  );
  return {
    data,
    isEnabled: !!contractAddress && !!tokenId,
    isError,
    isLoading,
  };
}
