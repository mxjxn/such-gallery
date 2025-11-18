import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, quoteCasts, suchGalleryUsers } from '~/lib/db';
import { eq } from 'drizzle-orm';

// POST /api/quote-casts - Track a quote-cast
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { curatorFid, castHash, targetType, targetCollectionId, targetContractAddress, targetTokenId, referralAddress } = body;

    if (!curatorFid || !castHash || !targetType || !referralAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (targetType === 'collection' && !targetCollectionId) {
      return NextResponse.json(
        { success: false, error: 'targetCollectionId required for collection type' },
        { status: 400 }
      );
    }

    if (targetType === 'nft' && (!targetContractAddress || !targetTokenId)) {
      return NextResponse.json(
        { success: false, error: 'targetContractAddress and targetTokenId required for nft type' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Ensure user exists
    const [existingUser] = await db
      .select()
      .from(suchGalleryUsers)
      .where(eq(suchGalleryUsers.fid, curatorFid))
      .limit(1);

    if (!existingUser) {
      await db.insert(suchGalleryUsers).values({
        fid: curatorFid,
        ethAddress: referralAddress,
      });
    } else if (!existingUser.ethAddress) {
      // Update user with referral address if not set
      await db
        .update(suchGalleryUsers)
        .set({ ethAddress: referralAddress })
        .where(eq(suchGalleryUsers.fid, curatorFid));
    }

    const [newQuoteCast] = await db
      .insert(quoteCasts)
      .values({
        curatorFid,
        castHash,
        targetType,
        targetCollectionId: targetCollectionId || null,
        targetContractAddress: targetContractAddress ? targetContractAddress.toLowerCase() : null,
        targetTokenId: targetTokenId || null,
        referralAddress: referralAddress.toLowerCase(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      quoteCast: {
        id: newQuoteCast.id,
        curatorFid: newQuoteCast.curatorFid,
        castHash: newQuoteCast.castHash,
        targetType: newQuoteCast.targetType,
        targetCollectionId: newQuoteCast.targetCollectionId,
        targetContractAddress: newQuoteCast.targetContractAddress,
        targetTokenId: newQuoteCast.targetTokenId,
        referralAddress: newQuoteCast.referralAddress,
        createdAt: newQuoteCast.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating quote-cast:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quote-cast' },
      { status: 500 }
    );
  }
}

// GET /api/quote-casts - Get quote-casts (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const curatorFid = searchParams.get('curatorFid');
    const targetCollectionId = searchParams.get('targetCollectionId');
    const targetContractAddress = searchParams.get('targetContractAddress');
    const targetTokenId = searchParams.get('targetTokenId');

    const db = getDatabase();
    let query = db.select().from(quoteCasts);

    if (curatorFid) {
      query = query.where(eq(quoteCasts.curatorFid, parseInt(curatorFid)));
    }
    // Note: Additional filters would need more complex query building

    const casts = await query;

    return NextResponse.json({
      success: true,
      quoteCasts: casts.map(qc => ({
        id: qc.id,
        curatorFid: qc.curatorFid,
        castHash: qc.castHash,
        targetType: qc.targetType,
        targetCollectionId: qc.targetCollectionId,
        targetContractAddress: qc.targetContractAddress,
        targetTokenId: qc.targetTokenId,
        referralAddress: qc.referralAddress,
        createdAt: qc.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching quote-casts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quote-casts' },
      { status: 500 }
    );
  }
}

