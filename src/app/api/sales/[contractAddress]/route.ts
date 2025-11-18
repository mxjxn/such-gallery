import { NextRequest, NextResponse } from 'next/server';
import { getSalesForCollection } from '@cryptoart/unified-indexer';
import { BASE_CHAIN_ID } from '~/lib/constants';
import { Address } from 'viem';

// GET /api/sales/[contractAddress] - Get pools + auctions for a collection
export async function GET(
  request: NextRequest,
  { params }: { params: { contractAddress: string } }
) {
  try {
    const contractAddress = params.contractAddress as Address;
    const { searchParams } = new URL(request.url);
    const first = searchParams.get('first') ? parseInt(searchParams.get('first')!) : 100;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : 0;

    const sales = await getSalesForCollection(contractAddress, BASE_CHAIN_ID, {
      first,
      skip,
    });

    return NextResponse.json({
      success: true,
      contractAddress,
      pools: sales.pools,
      auctions: sales.auctions,
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales data' },
      { status: 500 }
    );
  }
}

