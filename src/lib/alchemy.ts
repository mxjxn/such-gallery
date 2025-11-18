import { Alchemy, Network, NftTokenType } from 'alchemy-sdk';
import { BASE_CHAIN_ID } from './constants';

let alchemyClient: Alchemy | null = null;

export function getAlchemyClient() {
  if (!alchemyClient) {
    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      throw new Error('ALCHEMY_API_KEY not configured');
    }
    
    const config = {
      apiKey,
      network: Network.BASE_MAINNET,
    };
    
    alchemyClient = new Alchemy(config);
  }
  return alchemyClient;
}

export interface NFTMetadata {
  name?: string;
  description?: string;
  imageURI?: string;
  animationURI?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  tokenURI?: string;
}

export async function getNFTMetadata(
  contractAddress: string,
  tokenId: string
): Promise<NFTMetadata | null> {
  try {
    const alchemy = getAlchemyClient();
    const nft = await alchemy.nft.getNftMetadata(contractAddress, tokenId);
    
    return {
      name: nft.name,
      description: nft.description,
      imageURI: nft.image?.originalUrl || nft.image?.pngUrl || nft.image?.cachedUrl,
      animationURI: nft.animation?.originalUrl,
      attributes: nft.raw?.metadata?.attributes as Array<{ trait_type: string; value: string | number }> | undefined,
      tokenURI: nft.tokenUri?.raw,
    };
  } catch (error) {
    console.error('Error fetching NFT metadata from Alchemy:', error);
    return null;
  }
}

export async function getContractMetadata(contractAddress: string) {
  try {
    const alchemy = getAlchemyClient();
    const contract = await alchemy.nft.getContractMetadata(contractAddress);
    
    return {
      name: contract.name || 'Unknown',
      symbol: contract.symbol || 'UNKNOWN',
      totalSupply: contract.totalSupply,
    };
  } catch (error) {
    console.error('Error fetching contract metadata from Alchemy:', error);
    return null;
  }
}

