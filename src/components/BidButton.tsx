'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { AUCTIONHOUSE_ADDRESS, AUCTIONHOUSE_ABI } from '~/lib/contracts';
import { type Address } from 'viem';
import { useState } from 'react';

interface BidButtonProps {
  listingId: number | bigint;
  referralAddress?: string | null;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function BidButton({
  listingId,
  referralAddress,
  disabled = false,
  onSuccess,
  onError,
}: BidButtonProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [isPending, setIsPending] = useState(false);

  // Get listing details to show current bid and minimum
  const { data: listing } = useReadContract({
    address: AUCTIONHOUSE_ADDRESS,
    abi: AUCTIONHOUSE_ABI,
    functionName: 'getListing',
    args: [BigInt(listingId)],
  });

  const { data: currentPrice } = useReadContract({
    address: AUCTIONHOUSE_ADDRESS,
    abi: AUCTIONHOUSE_ABI,
    functionName: 'getListingCurrentPrice',
    args: [BigInt(listingId)],
  });

  const { writeContract, data: hash, error, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const currentBidAmount = listing?.bid?.amount || 0n;
  const initialAmount = listing?.details?.initialAmount || 0n;
  const minIncrementBPS = listing?.details?.minIncrementBPS || 0;
  const minBid = currentBidAmount > 0n
    ? currentBidAmount + (currentBidAmount * BigInt(minIncrementBPS)) / 10000n
    : initialAmount;

  const handleBid = async () => {
    try {
      if (!bidAmount) {
        throw new Error('Please enter a bid amount');
      }

      const bidValue = parseEther(bidAmount);
      if (bidValue < minBid) {
        throw new Error(`Bid must be at least ${formatEther(minBid)} ETH`);
      }

      setIsPending(true);

      if (referralAddress) {
        await writeContract({
          address: AUCTIONHOUSE_ADDRESS,
          abi: AUCTIONHOUSE_ABI,
          functionName: 'bid',
          args: [referralAddress as Address, BigInt(listingId), true],
          value: bidValue,
        });
      } else {
        await writeContract({
          address: AUCTIONHOUSE_ADDRESS,
          abi: AUCTIONHOUSE_ABI,
          functionName: 'bid',
          args: [BigInt(listingId), true],
          value: bidValue,
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Bid failed');
      console.error('Bid error:', error);
      onError?.(error);
      setIsPending(false);
    }
  };

  // Handle success
  if (isSuccess && isPending) {
    setIsPending(false);
    setBidAmount('');
    onSuccess?.();
  }

  const isLoading = isWriting || isConfirming || isPending;
  const buttonText = isLoading
    ? isConfirming
      ? 'Confirming...'
      : 'Placing bid...'
    : 'Place Bid';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="bid-amount" className="text-sm font-medium">
          Bid Amount (ETH)
        </label>
        <input
          id="bid-amount"
          type="number"
          step="0.001"
          min={Number(formatEther(minBid))}
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder={formatEther(minBid)}
          className="input"
          disabled={disabled || isLoading}
        />
        <p className="text-xs text-gray-600">
          Minimum bid: {formatEther(minBid)} ETH
          {currentBidAmount > 0n && (
            <> (Current: {formatEther(currentBidAmount)} ETH)</>
          )}
        </p>
      </div>

      <button
        onClick={handleBid}
        disabled={disabled || isLoading || !bidAmount}
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
        <p className="text-sm text-green-600">Bid placed successfully!</p>
      )}
    </div>
  );
}

