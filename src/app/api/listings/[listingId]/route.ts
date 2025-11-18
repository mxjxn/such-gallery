import { NextRequest, NextResponse } from 'next/server';
import { getAuctionData } from '@cryptoart/unified-indexer';
import { BASE_CHAIN_ID } from '~/lib/constants';

// GET /api/listings/[listingId] - Get listing details
export async function GET(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  try {
    const listingId = params.listingId;
    const auction = await getAuctionData(listingId, BASE_CHAIN_ID);

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      auction,
    });
  } catch (error) {
    console.error('Error fetching listing data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listing data' },
      { status: 500 }
    );
  }
}

