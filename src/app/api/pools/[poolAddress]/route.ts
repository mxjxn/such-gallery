import { NextRequest, NextResponse } from 'next/server';
import { getPoolData } from '@cryptoart/unified-indexer';
import { BASE_CHAIN_ID } from '~/lib/constants';
import { Address } from 'viem';

// GET /api/pools/[poolAddress] - Get pool details
export async function GET(
  request: NextRequest,
  { params }: { params: { poolAddress: string } }
) {
  try {
    const poolAddress = params.poolAddress as Address;
    const pool = await getPoolData(poolAddress, BASE_CHAIN_ID);

    if (!pool) {
      return NextResponse.json(
        { success: false, error: 'Pool not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pool,
    });
  } catch (error) {
    console.error('Error fetching pool data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pool data' },
      { status: 500 }
    );
  }
}

