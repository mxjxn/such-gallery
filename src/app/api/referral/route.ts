import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, quoteCasts } from '~/lib/db';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/referral?collectionId=X - Get referral address for collection
// GET /api/referral?contractAddress=X&tokenId=Y - Get referral address for NFT
// GET /api/referral?ref=0x... - Direct referral address override
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check for direct referral override
    const refParam = searchParams.get('ref');
    if (refParam) {
      // Validate it's a valid Ethereum address
      if (/^0x[a-fA-F0-9]{40}$/.test(refParam)) {
        return NextResponse.json({
          success: true,
          referralAddress: refParam.toLowerCase(),
          source: 'url_param',
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid referral address format' },
          { status: 400 }
        );
      }
    }

    const collectionId = searchParams.get('collectionId');
    const contractAddress = searchParams.get('contractAddress');
    const tokenId = searchParams.get('tokenId');

    if (!collectionId && (!contractAddress || !tokenId)) {
      return NextResponse.json(
        { success: false, error: 'Missing collectionId or contractAddress+tokenId' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    if (collectionId) {
      // Get most recent quote-cast for this collection
      const [quoteCast] = await db
        .select()
        .from(quoteCasts)
        .where(
          and(
            eq(quoteCasts.targetType, 'collection'),
            eq(quoteCasts.targetCollectionId, parseInt(collectionId))
          )
        )
        .orderBy(desc(quoteCasts.createdAt))
        .limit(1);

      if (quoteCast) {
        return NextResponse.json({
          success: true,
          referralAddress: quoteCast.referralAddress,
          source: 'quote_cast',
          quoteCastId: quoteCast.id,
          curatorFid: quoteCast.curatorFid,
        });
      }
    } else if (contractAddress && tokenId) {
      // Get most recent quote-cast for this NFT
      const normalizedAddress = contractAddress.toLowerCase();
      const [quoteCast] = await db
        .select()
        .from(quoteCasts)
        .where(
          and(
            eq(quoteCasts.targetType, 'nft'),
            eq(quoteCasts.targetContractAddress, normalizedAddress),
            eq(quoteCasts.targetTokenId, tokenId)
          )
        )
        .orderBy(desc(quoteCasts.createdAt))
        .limit(1);

      if (quoteCast) {
        return NextResponse.json({
          success: true,
          referralAddress: quoteCast.referralAddress,
          source: 'quote_cast',
          quoteCastId: quoteCast.id,
          curatorFid: quoteCast.curatorFid,
        });
      }
    }

    // No referral found
    return NextResponse.json({
      success: true,
      referralAddress: null,
      source: null,
    });
  } catch (error) {
    console.error('Error fetching referral address:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referral address' },
      { status: 500 }
    );
  }
}

