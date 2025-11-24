'use client';

import { useAccount } from 'wagmi';
import { useState } from 'react';
import {
  generateCollectionQuoteCastUrl,
  generateNftQuoteCastUrl,
} from '~/lib/quoteCast';

interface QuoteCastButtonProps {
  targetType: 'collection' | 'nft';
  targetId?: number | string; // For collections
  contractAddress?: string; // For NFTs
  tokenId?: string; // For NFTs
  curatorFid: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function QuoteCastButton({
  targetType,
  targetId,
  contractAddress,
  tokenId,
  curatorFid,
  onSuccess,
  onError,
}: QuoteCastButtonProps) {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuoteCast = async () => {
    if (!address) {
      onError?.(new Error('Please connect your wallet'));
      return;
    }

    try {
      setIsLoading(true);

      // Generate the quote-cast URL
      let quoteCastUrl: string;
      if (targetType === 'collection' && targetId) {
        quoteCastUrl = generateCollectionQuoteCastUrl(targetId, address);
      } else if (targetType === 'nft' && contractAddress && tokenId) {
        quoteCastUrl = generateNftQuoteCastUrl(contractAddress, tokenId, address);
      } else {
        throw new Error('Invalid target type or missing parameters');
      }

      // Open Farcaster client to post quote-cast
      // In a real implementation, you might use the Farcaster SDK or open a new window
      // For now, we'll copy to clipboard and show instructions
      await navigator.clipboard.writeText(quoteCastUrl);

      // Track the quote-cast after user posts it
      // Note: In a real implementation, you'd want to detect when the cast is posted
      // For now, we'll call the API immediately (user should post manually)
      const response = await fetch('/api/quote-casts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curatorFid,
          castHash: '', // Will be updated when we detect the actual cast
          targetType,
          targetGalleryId: targetType === 'collection' ? targetId : undefined,
          targetContractAddress: targetType === 'nft' ? contractAddress : undefined,
          targetTokenId: targetType === 'nft' ? tokenId : undefined,
          referralAddress: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to track quote-cast');
      }

      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Quote-cast failed');
      console.error('Quote-cast error:', error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleQuoteCast}
      disabled={isLoading || !address}
      className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Preparing...' : 'Quote Cast'}
    </button>
  );
}

