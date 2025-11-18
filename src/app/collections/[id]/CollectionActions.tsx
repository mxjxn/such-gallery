'use client';

import { QuoteCastButton } from '~/components/QuoteCastButton';
import { useReferralAddress } from '~/hooks/useReferralAddress';

interface CollectionActionsProps {
  collectionId: number;
  curatorFid: number;
}

export function CollectionActions({ collectionId, curatorFid }: CollectionActionsProps) {
  const { referralAddress } = useReferralAddress({ collectionId });

  return (
    <div className="mb-6">
      <QuoteCastButton
        targetType="collection"
        targetId={collectionId}
        curatorFid={curatorFid}
      />
      {referralAddress && (
        <p className="text-xs text-gray-500 mt-2">
          Referral: {referralAddress.slice(0, 10)}...{referralAddress.slice(-8)}
        </p>
      )}
    </div>
  );
}

