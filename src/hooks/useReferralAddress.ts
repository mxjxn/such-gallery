import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

interface UseReferralAddressOptions {
  collectionId?: number | string;
  contractAddress?: string;
  tokenId?: string;
  enabled?: boolean;
}

export function useReferralAddress(options: UseReferralAddressOptions = {}) {
  const { collectionId, contractAddress, tokenId, enabled = true } = options;
  const searchParams = useSearchParams();

  // Check URL params first
  const refFromUrl = useMemo(() => {
    const ref = searchParams?.get('ref');
    if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
      return ref.toLowerCase();
    }
    return null;
  }, [searchParams]);

  // Fetch from API if no URL param and we have context
  const { data, isLoading, error } = useQuery({
    queryKey: ['referral', collectionId, contractAddress, tokenId],
    queryFn: async () => {
      let url = '/api/referral?';
      if (collectionId) {
        url += `collectionId=${collectionId}`;
      } else if (contractAddress && tokenId) {
        url += `contractAddress=${contractAddress}&tokenId=${tokenId}`;
      } else {
        return null;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch referral address');
      }
      const data = await response.json();
      return data.referralAddress as string | null;
    },
    enabled: enabled && !refFromUrl && (!!collectionId || (!!contractAddress && !!tokenId)),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    referralAddress: refFromUrl || data || null,
    isLoading: !refFromUrl && isLoading,
    error,
    source: refFromUrl ? 'url' : data ? 'api' : null,
  };
}

