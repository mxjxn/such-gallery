import prisma from "@/prisma";
import { FullNftWithListing } from "@/types/types";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const params = await request.json();

  const { nftData }: { ethAddress: string; nftData: FullNftWithListing } =
    params;

  const { contractAddress, tokenId } = nftData;
  let listingObj: {
    listingId: number;
    seller: string;
    finalized: boolean;
    totalAvailable?: number;
  };
  let listingTypeObj: {
    manifoldBuyNowListing?: any;
    manifoldAuctionListing?: any;
  } = {};
  const queryObj = {
    connectOrCreate: {
      where: {
        listingId: nftData.listingId,
      },
      create: {},
    },
  };
  if (nftData.listingId) {
    listingObj = {
      listingId: nftData.listingId,
      seller: nftData.seller || "",
      finalized: nftData.finalized || false,
    };
		console.log("🚀 ~ ", nftData.listingType)
    if (nftData.listingType == 2) {
      listingObj.totalAvailable = nftData.totalAvailable || 0;
      queryObj.connectOrCreate.create = listingObj;
      listingTypeObj.manifoldBuyNowListing = queryObj;
    } else if (nftData.listingType == 1) {
      queryObj.connectOrCreate.create = listingObj;
      listingTypeObj.manifoldAuctionListing = queryObj;
    }
  }
  const nft = await prisma.nFT.create({
    data: {
      tokenId,
      contractAddress,
      metadataURI: nftData.metadataURI || "",
      imageURI: nftData.imageURI || "",
      title: nftData.title,
      description: nftData.description || "",
      manifoldBuyNowListing: listingTypeObj.manifoldBuyNowListing,
      manifoldAuctionListing: listingTypeObj.manifoldAuctionListing,
    },
		select: {
			id: true
		}
  });
  return NextResponse.json({ nft });
}
