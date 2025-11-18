'use client';

import { QuoteCastButton } from '~/components/QuoteCastButton';
import { PurchaseButton } from '~/components/PurchaseButton';
import { BidButton } from '~/components/BidButton';
import { useReferralAddress } from '~/hooks/useReferralAddress';
import { useState, useEffect } from 'react';

interface NFTActionsProps {
  contractAddress: string;
  tokenId: string;
  curatorFid?: number;
}

export function NFTActions({ contractAddress, tokenId, curatorFid }: NFTActionsProps) {
  const { referralAddress } = useReferralAddress({
    contractAddress,
    tokenId,
  });
  const [listingId, setListingId] = useState<number | null>(null);
  const [listingPrice, setListingPrice] = useState<bigint | null>(null);
  const [isAuction, setIsAuction] = useState(false);

  // Fetch sales data to get listing info
  useEffect(() => {
    async function fetchSalesData() {
      try {
        const response = await fetch(`/api/sales/${contractAddress}`);
        if (!response.ok) return;

        const data = await response.json();
        if (data.success && data.auctions && data.auctions.length > 0) {
          // Use first auction/listing
          const listing = data.auctions[0];
          setListingId(parseInt(listing.listingId));
          setListingPrice(BigInt(listing.reservePrice || listing.buyNowPrice || '0'));
          setIsAuction(listing.listingType === 'INDIVIDUAL_AUCTION');
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    }

    fetchSalesData();
  }, [contractAddress]);

  return (
    <div className="space-y-4">
      {curatorFid && (
        <div>
          <QuoteCastButton
            targetType="nft"
            contractAddress={contractAddress}
            tokenId={tokenId}
            curatorFid={curatorFid}
          />
          {referralAddress && (
            <p className="text-xs text-gray-500 mt-2">
              Referral: {referralAddress.slice(0, 10)}...{referralAddress.slice(-8)}
            </p>
          )}
        </div>
      )}

      {listingId && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Purchase Options</h3>
          {isAuction ? (
            <BidButton
              listingId={listingId}
              referralAddress={referralAddress}
            />
          ) : (
            <PurchaseButton
              listingId={listingId}
              referralAddress={referralAddress}
              price={listingPrice || undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}

