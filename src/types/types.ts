export interface Nft {
	chain: string;
	contractAddress: string;
	tokenId: string;
}

export type UserData = {
	ethAddress: string;
	name?: string;
	bio?: string;
	ensName?: string;
}
