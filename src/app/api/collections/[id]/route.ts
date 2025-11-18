import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, curatedCollections, curatedCollectionNfts } from '~/lib/db';
import { eq } from 'drizzle-orm';

// GET /api/collections/[id] - Get a single collection with NFTs
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDatabase();
    const collectionId = parseInt(params.id);

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

    const nfts = await db
      .select()
      .from(curatedCollectionNfts)
      .where(eq(curatedCollectionNfts.curatedCollectionId, collectionId));

    return NextResponse.json({
      success: true,
      collection: {
        id: collection.id,
        curatorFid: collection.curatorFid,
        title: collection.title,
        slug: collection.slug,
        isPublished: collection.isPublished,
        description: collection.description,
        createdAt: collection.createdAt.toISOString(),
        updatedAt: collection.updatedAt.toISOString(),
      },
      nfts: nfts.map(nft => ({
        curatedCollectionId: nft.curatedCollectionId,
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId,
        curatorComment: nft.curatorComment,
        showDescription: nft.showDescription,
        showAttributes: nft.showAttributes,
        addedAt: nft.addedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

// PUT /api/collections/[id] - Update a collection (only by owner)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { curatorFid, title, slug, description, isPublished } = body;
    const collectionId = parseInt(params.id);

    if (!curatorFid) {
      return NextResponse.json(
        { success: false, error: 'curatorFid required' },
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

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(curatedCollections)
      .set(updateData)
      .where(eq(curatedCollections.id, collectionId))
      .returning();

    return NextResponse.json({
      success: true,
      collection: {
        id: updated.id,
        curatorFid: updated.curatorFid,
        title: updated.title,
        slug: updated.slug,
        isPublished: updated.isPublished,
        description: updated.description,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[id] - Delete a collection (only by owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const curatorFid = searchParams.get('curatorFid');
    const collectionId = parseInt(params.id);

    if (!curatorFid) {
      return NextResponse.json(
        { success: false, error: 'curatorFid required' },
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
      .delete(curatedCollections)
      .where(eq(curatedCollections.id, collectionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}

