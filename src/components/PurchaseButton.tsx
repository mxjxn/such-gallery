'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { AUCTIONHOUSE_ADDRESS, AUCTIONHOUSE_ABI } from '~/lib/contracts';
import { type Address } from 'viem';
import { useState } from 'react';

interface PurchaseButtonProps {
  listingId: number | bigint;
  referralAddress?: string | null;
  price?: bigint | string; // Price in wei or ETH string
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PurchaseButton({
  listingId,
  referralAddress,
  price,
  disabled = false,
  onSuccess,
  onError,
}: PurchaseButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const { writeContract, data: hash, error, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handlePurchase = async () => {
    try {
      setIsPending(true);
      const value = price
        ? typeof price === 'string'
          ? parseEther(price)
          : BigInt(price)
        : undefined;

      if (referralAddress) {
        await writeContract({
          address: AUCTIONHOUSE_ADDRESS,
          abi: AUCTIONHOUSE_ABI,
          functionName: 'purchase',
          args: [referralAddress as Address, BigInt(listingId)],
          value,
        });
      } else {
        await writeContract({
          address: AUCTIONHOUSE_ADDRESS,
          abi: AUCTIONHOUSE_ABI,
          functionName: 'purchase',
          args: [BigInt(listingId)],
          value,
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Purchase failed');
      console.error('Purchase error:', error);
      onError?.(error);
      setIsPending(false);
    }
  };

  // Handle success
  if (isSuccess && isPending) {
    setIsPending(false);
    onSuccess?.();
  }

  const isLoading = isWriting || isConfirming || isPending;
  const buttonText = isLoading
    ? isConfirming
      ? 'Confirming...'
      : 'Purchasing...'
    : 'Purchase';

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handlePurchase}
        disabled={disabled || isLoading}
        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {buttonText}
      </button>
      {error && (
        <p className="text-sm text-red-600">
          {error.message || 'Transaction failed'}
        </p>
      )}
      {hash && (
        <p className="text-xs text-gray-600">
          Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
        </p>
      )}
      {isSuccess && (
        <p className="text-sm text-green-600">Purchase successful!</p>
      )}
    </div>
  );
}

