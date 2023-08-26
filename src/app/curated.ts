"use server";
import prisma from "@/prisma";
import { FullNft, FullNftWithListing } from "@/types/types";
import {
  CuratedCollection,
  CuratedCollectionNFT,
  Prisma,
} from "@prisma/client";
import _ from "lodash";

function convertToKebabCase(str: string): string {
  // Convert to lowercase and replace unwanted characters and spaces with hyphens
  let result = str.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Remove leading or trailing hyphens
  result = result.replace(/^-|-$/g, "");

  // Limit to 5 words
  let words = result.split("-");
  if (words.length > 5) {
    result = words.slice(0, 5).join("-");
  }

  return result;
}

export async function createCuratedList(
  userId: number,
  title: string = "untitled"
): Promise<CuratedCollection | null> {
  const curatedList = await prisma.curatedCollection.create({
    data: {
      curatorId: userId,
      title: title,
      slug: convertToKebabCase(title),
    },
  });

  return curatedList;
}

export async function addNftToCuratedList(
  nftId: number,
  listId: number
): Promise<CuratedCollection | null> {
  const curatedCollectionNFT = await prisma.curatedCollectionNFT.create({
    data: {
      curatedCollectionId: listId,
      nftId: nftId,
    },
  });
  return await prisma.curatedCollection.findUnique({
    where: { id: curatedCollectionNFT.curatedCollectionId },
    include: { nfts: true },
  });
}

export async function addNewNftToCuratedList(
  nftData: FullNftWithListing,
  listId: number
): Promise<CuratedCollection | null> {
  let nft, curatedCollectionNFT, resultingCollection;
  try {
    nft = await prisma.nFT.findUnique({
      where: {
        contractAddress_tokenId: {
          contractAddress: nftData.contractAddress,
          tokenId: String(nftData.tokenId),
        },
      },
    });
  } catch (e: any) {
    console.error("Error fetching existing NFT", e);
  }
	if (!!nft && nftData.listingId) {
		// update listing
		nft = await prisma.nFT.update({
			where: {
				id: nft.id
			},
			data: {
				manifoldAuctionListing: {
					connectOrCreate: {
						where: {
							listingId: nftData.listingId,
						},
						create: {
							seller: nftData.seller || "",
							listingId: nftData.listingId,
							finalized: nftData.finalized || false, // TODO fix the type
						}
					}
				}
			},
		})
	}
  if (!nft) {
    let listingData: any,
      listingType: number = nftData.listingType || 0;
    // 0 is no listing, 1 is buynow, 2 is auction

    if ("listingId" in nftData) {
      listingData = {
        connectOrCreate: {
          where: {
            listingId: nftData.listingId,
          },
          create: {
            listingId: nftData.listingId,
            seller: nftData.seller,
            finalized: nftData.finalized,
          },
        },
      };
      if (nftData.totalAvailable) {
        listingData.connectOrCreate.create.totalAvailable =
          nftData.totalAvailable;
      }
    }
    try {
      nft = await prisma.nFT.create({
        data: {
          title: nftData.title,
          metadataURI: nftData.metadataURI,
          tokenId: nftData.tokenId,
          imageURI: nftData.imageURI || "",
          description: nftData.description,
          manifoldBuyNowListing: listingType === 2 ? listingData : undefined,
          manifoldAuctionListing: listingType === 1 ? listingData : undefined,
          collection: {
            connectOrCreate: {
              where: {
                contractAddress: nftData.contractAddress,
              },
              create: {
                contractAddress: nftData.contractAddress,
                name: nftData.collectionName,
              },
            },
          },
        },
        select: {
          id: true,
        },
      });
    } catch (e: any) {
      console.error("Error saving NFT to server", e);
      throw new Error(e);
    }
  }
  if (!_.isEmpty(nft)) {
    try {
      curatedCollectionNFT = await prisma.curatedCollectionNFT.create({
        data: {
          curatedCollectionId: listId,
          nftId: nft.id,
        },
      });
    } catch (e: any) {
      console.error("Error saving curatedCollectionNFT to server", e);
    }
  }
  if (!_.isEmpty(curatedCollectionNFT)) {
    try {
      resultingCollection = prisma.curatedCollection.findUnique({
        where: { id: curatedCollectionNFT.curatedCollectionId },
        include: { nfts: true },
      });
    } catch (e: any) {
      console.error("Error fetching finalized curatedCollection", e);
    }
  }
  return resultingCollection || null;
}

export async function getUserCuratedLists(
  userId: number
): Promise<CuratedCollection[]> {
  const curatedCollections = await prisma.curatedCollection.findMany({
    where: {
      curatorId: userId,
    },
    include: {
      nfts: {
        include: {
          nft: true,
        },
      },
    },
  });

  return curatedCollections;
}

export async function getUserCuratedListsByAddress(
  ethAddress: string
): Promise<any> {
  const user = await prisma.user.findFirst({ where: { ethAddress } });
  if (!user) {
    return [];
  }
  const curatedCollections = await prisma.curatedCollection.findMany({
    where: {
      curatorId: user.id,
    },
    select: {
      title: true,
      curatorId: true,
      slug: true,
      nfts: {
        include: {
          nft: true,
        },
      },
    },
  });

  return curatedCollections;
}

export type CuratedCollectionId = {
  curatorId: number;
  slug: string;
};

export async function updateCuratedListTitle(
  collection: CuratedCollectionId,
  title: string
): Promise<CuratedCollection> {
  const curatedCollection = await prisma.curatedCollection.update({
    where: {
      curatorId_slug: {
        curatorId: collection.curatorId,
        slug: collection.slug,
      },
    },
    data: {
      title: title,
      slug: convertToKebabCase(title),
    },
  });
  return curatedCollection;
}

export async function updateNftCuratorComment(
  curation: number,
  id: number,
  note: string
): Promise<CuratedCollectionNFT> {
  const updatedCuration = await prisma.curatedCollectionNFT.update({
    where: {
      curatedCollectionId_nftId: {
        curatedCollectionId: curation,
        nftId: id,
      },
    },
    data: { curatorComment: note },
  });
  return updatedCuration;
}

export async function updateNftCurationDescription(
  curation: number,
  id: number,
  toggle: boolean
): Promise<CuratedCollectionNFT> {
  const updatedCuration = await prisma.curatedCollectionNFT.update({
    where: {
      curatedCollectionId_nftId: {
        curatedCollectionId: curation,
        nftId: id,
      },
    },
    data: {
      showDescription: toggle,
    },
  });
  return updatedCuration;
}
