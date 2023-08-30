"use server";

import prisma from "@/prisma";
import { FullNft, FullNftWithListing } from "@/types/types";
import { Prisma } from "@prisma/client";
import _ from "lodash";
import {SITE_URL} from "@/utils/config"


export async function getNftsByUser(ethAddress: string) {
  const user = await fetch(
    `${SITE_URL}/api/userSavedNfts?address=${ethAddress}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  return user.json();
}

export async function addNftToUser(
  ethAddress: string,
  nftData: FullNft | FullNftWithListing
) {
  const butt = await fetch(`${SITE_URL}/api/saveNft`, {
    method: "POST",
    body: JSON.stringify({
      ethAddress,
      nftData,
    }),
  });
  return await butt.json();
}

export async function removeNftFromUser(
  ethAddress: string,
	nftId: number
) {
	console.log("⚡️⚡️⚡️⚡️⚡️before delete:",{ethAddress, nftId})
	let removedNft;
	try{
	 removedNft = await fetch(`${SITE_URL}/api/deleteNft?ethAddress=${ethAddress}&nftId=${nftId}`, {
		 method: "DELETE",
	 })
	} catch(e){
		console.error("error removing nft", e)
	}
	console.log("⚡️⚡️⚡️⚡️⚡️after delete:")
	 return await removedNft?.json();
}
