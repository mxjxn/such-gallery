import { endpoint, networks } from "@/utils/zora";
import { FullNft, FullNftWithListing, NftId } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { ZDK } from "@zoralabs/zdk";
import {
  CollectionSortKey,
  CollectionsQuery,
  SortDirection,
  TokenQuery,
} from "@zoralabs/zdk/dist/queries/queries-sdk";
import _ from "lodash";

const zdk = new ZDK({ networks, endpoint });

async function getNft(
  nft: NftId,
  includeFullDetails: boolean
): Promise<TokenQuery|null> {
	if(!nft?.contractAddress || !nft?.tokenId) {
		return null;
	}
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
  return banana;
}

type UseNftReturn = {
  data: FullNftWithListing | undefined;
  isLoading: boolean;
  isError: boolean;
};

type UseNftOptions = {
	isEnabled?: boolean;
}

export function useNft(nft: NftId | null, opts?:UseNftOptions): UseNftReturn {
  const { contractAddress = "", tokenId = "", chain = "1" } = nft || {};
	const { isEnabled = true } = opts || {};
  const { data: collectionName } = useQuery(
    ["nftCollectionName", contractAddress],
    async () => await getCollectionName({ contractAddress }),
    {
      enabled: isEnabled,
      onSuccess: (data) => { },
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
      enabled: isEnabled,
      onError: (error) => {
        console.error("error at zora getToken call", error);
      },
      onSuccess: (data) => { },
    }
  );
  return {
    data: !!nft && data ? {
      contractAddress: String(nft.contractAddress),
      tokenId: String(nft.tokenId),
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
    isError,
    isLoading,
  };
}
