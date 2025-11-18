import { APP_URL } from './constants';
import { type Address } from 'viem';

/**
 * Generate a quote-cast URL for a collection with referral address
 */
export function generateCollectionQuoteCastUrl(
  collectionId: number | string,
  referralAddress: string
): string {
  const url = new URL(`${APP_URL}/collections/${collectionId}`, APP_URL);
  url.searchParams.set('ref', referralAddress.toLowerCase());
  return url.toString();
}

/**
 * Generate a quote-cast URL for an NFT with referral address
 */
export function generateNftQuoteCastUrl(
  contractAddress: string,
  tokenId: string,
  referralAddress: string
): string {
  const url = new URL(
    `${APP_URL}/nfts/${contractAddress.toLowerCase()}/${tokenId}`,
    APP_URL
  );
  url.searchParams.set('ref', referralAddress.toLowerCase());
  return url.toString();
}

/**
 * Extract referral address from a such.gallery URL
 */
export function extractReferralFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const ref = urlObj.searchParams.get('ref');
    if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
      return ref.toLowerCase();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse a such.gallery URL to extract collection or NFT info
 */
export function parseSuchGalleryUrl(url: string): {
  type: 'collection' | 'nft' | null;
  collectionId?: number;
  contractAddress?: string;
  tokenId?: string;
} {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Match /collections/[id]
    const collectionMatch = pathname.match(/^\/collections\/(\d+)$/);
    if (collectionMatch) {
      return {
        type: 'collection',
        collectionId: parseInt(collectionMatch[1]),
      };
    }

    // Match /nfts/[contractAddress]/[tokenId]
    const nftMatch = pathname.match(/^\/nfts\/(0x[a-fA-F0-9]{40})\/(.+)$/);
    if (nftMatch) {
      return {
        type: 'nft',
        contractAddress: nftMatch[1].toLowerCase(),
        tokenId: nftMatch[2],
      };
    }

    return { type: null };
  } catch {
    return { type: null };
  }
}

