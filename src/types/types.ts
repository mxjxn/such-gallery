export type NftId = {
  contractAddress?: string;
  tokenId?: string;
  chain?: string | number;
}

export type UserData = {
  ethAddress: string;
  name?: string;
  bio?: string;
  ensName?: string;
};

export type Attribute = {
  trait_type: string;
  trait_value: string;
};

export type Metadata = {
  name?: string;
  description?: string;
  external_url?: string;
  image?: string;
  image_details?: any;
  image_url?: string;
  created_by?: string;
  attributes?: Array<Attribute & any>;
};

export type FullNft = {
  contractAddress: string;
  tokenId: string;
  chainId?: string;
  collectionName?: string;
  metadataURI: string;
  metadata?: Metadata;
  title: string;
  imageURI?: string;
  description?: string;
};

export type FullNftWithListing = FullNft & {
	listingId?: number;
	seller?: string;
	finalized?: boolean;
	totalAvailable?: number;
	listingType?: number; // 2 is buynow, 1 is auction
}
