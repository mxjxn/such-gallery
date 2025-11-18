import prisma from "@/prisma";
import { FullNftWithListing } from "@/types/types";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";
import { convertToKebabCase } from "@/utils/strings";

export async function POST(request: NextRequest) {
  const params = await request.json();
  const { nftId, listId }: { nftId: number; listId: number; } = params;
  let list;
  try {
    list = await prisma.curatedCollection.update({
			where: {
				id: listId
			},
      data: {
				nfts: {
					connectOrCreate: {
						where: {
							curatedCollectionId_nftId: {
								curatedCollectionId: listId,
								nftId,
							},
						},
						create: {
							nftId,
						}
					}
				}
      },
    });
  } catch (e: any) {
    console.error("Error creating list", e);
    throw new Error("Error creating list", e);
	}
  return NextResponse.json({ list });
}
