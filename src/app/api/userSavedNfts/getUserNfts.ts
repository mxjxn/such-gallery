"use server"
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function getUserNfts(address: string) {
	// this should be authenticated
	

  let user;
	try {
		user = await prisma.user.findUnique({
			where: {
				ethAddress: address,
			},
			include: {
				nfts: true,
			},
		});
	} catch (e: any) {
		throw new Error(`prisma error while finding user ${address} by address`, e);
	}
	
	if(user?.nfts){
		return NextResponse.json({ nfts: user?.nfts });
	}
	return NextResponse.json({ nfts: [] });
}
