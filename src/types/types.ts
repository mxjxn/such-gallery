export interface Nft {
	contractAddress: string;
	tokenId: string;
	chain?: string | number;
}

export type UserData = {
	ethAddress: string;
	name?: string;
	bio?: string;
	ensName?: string;
}

export type Metadata = {
  name?: string;
  description?: string;
  image?: string;
  image_details?: any;
  image_url?: string;
  created_by?: string;
  attributes?: Array<any>;
};
