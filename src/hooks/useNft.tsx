import { endpoint, networks } from "@/utils/zora";
import { Metadata, NftId } from "@/types/types";
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

export function zoraToSuchNft(nft) {
  const n = nft?.token;
  if (!nft) throw new Error("No nft found");
  return {
    contractAddress: n.token.collectionAddress,
    collectionName: n.collectionName,
    tokenId: n.token.tokenId,
    metadataURI: n.token.tokenUrl || "",
    imageURI: handleImageUrl(n.token.image?.url),
    title: n.token.name || "",
    description: n.token.description || "",
  };
}

type UseNftReturn = {
  data: Partial<FullNft>;
  isEnabled: boolean;
  isLoading: boolean;
  isError: boolean;
};

export function useNft(nft: NftId): UseNftReturn {
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
    () => getNft(nft, true),
    {
      enabled: !!contractAddress && !!tokenId,
      onError: (error) => {
        console.error("error at zora getToken call", error);
      },
      onSuccess: (data) => {
        console.log("data", data);
      },
    }
  );
  return {
    data: {
      contractAddress: nft?.contractAddress,
      tokenId: nft?.tokenId || "-1",
      title: data?.token?.token.name || undefined,
      imageURI: data?.token?.token.image?.url || undefined,
      metadataURI: data?.token?.token.tokenUrl || undefined,
      collectionName: _.get(
        collectionName,
        "collections.nodes.at(0).name",
        undefined
      ),
    },
    isEnabled: !!contractAddress && !!tokenId,
    isError,
    isLoading,
  };
}
