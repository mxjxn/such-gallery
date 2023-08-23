import { endpoint, networks } from "@/utils/zora";
import { FullNft, NftId } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { ZDK } from "@zoralabs/zdk";
import {
  CollectionSortKey,
  CollectionsQuery,
  SortDirection,
  TokenQuery,
} from "@zoralabs/zdk/dist/queries/queries-sdk";
import handleImageUrl from "@/lib/handleImageUrls";
import _ from "lodash";

const zdk = new ZDK({ networks, endpoint });

async function getNft(
  nft: NftId,
  includeFullDetails: boolean
): Promise<TokenQuery> {
  return await zdk.sdk.token({
    network: networks[0],
    token: {
      address: nft.contractAddress,
      tokenId: nft.tokenId,
    },
    includeFullDetails,
  });
}

async function getCollectionName({
  contractAddress,
}: {
  contractAddress: string;
}): Promise<CollectionsQuery> {
  const banana = await zdk.sdk.collections({
    where: {
      collectionAddresses: [contractAddress],
    },
    includeFullDetails: false,
    networks,
    pagination: { limit: 1 },
    sort: {
      sortDirection: SortDirection.Desc,
      sortKey: CollectionSortKey.Name,
    },
  });
  console.log("🍌", { banana });
  return banana;
}

type UseNftReturn = {
  data: FullNft | undefined;
  isEnabled: boolean;
  isLoading: boolean;
  isError: boolean;
};

export function useNft(nft: NftId | null): UseNftReturn {
  const { contractAddress = "", tokenId = "", chain = "1" } = nft || {};
  const { data: collectionName } = useQuery(
    ["nftCollectionName", contractAddress],
    () => getCollectionName({ contractAddress }),
    {
      enabled: !!contractAddress,
      onSuccess: (data) => {
        console.log("data", data);
      },
    }
  );
  const { data, isLoading, isError } = useQuery(
    ["nft", [chain, contractAddress, tokenId]],
    () => {
      if (!nft?.contractAddress || !nft?.tokenId) {
        return Promise.resolve({});
      }
      return getNft(nft, true);
    },
    {
      enabled: !!nft?.contractAddress && !!nft?.tokenId,
      onError: (error) => {
        console.error("error at zora getToken call", error);
      },
      onSuccess: (data) => {
        console.log("data", data);
      },
    }
  );
  return {
    data: !!nft && data ? {
      contractAddress: nft.contractAddress,
      tokenId: nft?.tokenId || "-1",
      title: _.get(data, "token.token.name", ""),
      imageURI: _.get(data, "token.token.image.url", ""),
      metadataURI: _.get(data, "token.token.tokenUrl", ""),
			metadata: _.get(data, 'token.token.metadata', {}),
      collectionName: _.get(
        collectionName,
        "collections.nodes.at(0).name",
        undefined
      ),
    }: undefined,
    isEnabled: !!contractAddress && !!tokenId,
    isError,
    isLoading,
  };
}
