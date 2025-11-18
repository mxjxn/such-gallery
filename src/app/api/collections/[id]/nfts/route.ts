import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, curatedCollections, curatedCollectionNfts } from '~/lib/db';
import { eq, and } from 'drizzle-orm';

// POST /api/collections/[id]/nfts - Add NFT to collection
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { curatorFid, contractAddress, tokenId, curatorComment, showDescription, showAttributes } = body;
    const collectionId = parseInt(params.id);

    if (!curatorFid || !contractAddress || !tokenId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Verify ownership
    const [collection] = await db
      .select()
      .from(curatedCollections)
      .where(eq(curatedCollections.id, collectionId))
      .limit(1);

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    if (collection.curatorFid !== curatorFid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if NFT already in collection
    const [existing] = await db
      .select()
      .from(curatedCollectionNfts)
      .where(
        and(
          eq(curatedCollectionNfts.curatedCollectionId, collectionId),
          eq(curatedCollectionNfts.contractAddress, contractAddress.toLowerCase()),
          eq(curatedCollectionNfts.tokenId, tokenId)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'NFT already in collection' },
        { status: 409 }
      );
    }

    const [newNft] = await db
      .insert(curatedCollectionNfts)
      .values({
        curatedCollectionId: collectionId,
        contractAddress: contractAddress.toLowerCase(),
        tokenId: tokenId,
        curatorComment: curatorComment || null,
        showDescription: showDescription !== undefined ? showDescription : true,
        showAttributes: showAttributes !== undefined ? showAttributes : false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      nft: {
        curatedCollectionId: newNft.curatedCollectionId,
        contractAddress: newNft.contractAddress,
        tokenId: newNft.tokenId,
        curatorComment: newNft.curatorComment,
        showDescription: newNft.showDescription,
        showAttributes: newNft.showAttributes,
        addedAt: newNft.addedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error adding NFT to collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add NFT to collection' },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[id]/nfts - Remove NFT from collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const curatorFid = searchParams.get('curatorFid');
    const contractAddress = searchParams.get('contractAddress');
    const tokenId = searchParams.get('tokenId');
    const collectionId = parseInt(params.id);

    if (!curatorFid || !contractAddress || !tokenId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Verify ownership
    const [collection] = await db
      .select()
      .from(curatedCollections)
      .where(eq(curatedCollections.id, collectionId))
      .limit(1);

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    if (collection.curatorFid !== parseInt(curatorFid)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await db
      .delete(curatedCollectionNfts)
      .where(
        and(
          eq(curatedCollectionNfts.curatedCollectionId, collectionId),
          eq(curatedCollectionNfts.contractAddress, contractAddress.toLowerCase()),
          eq(curatedCollectionNfts.tokenId, tokenId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing NFT from collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove NFT from collection' },
      { status: 500 }
    );
  }
}

