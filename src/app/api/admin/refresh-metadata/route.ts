import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, adminUsers, curatedCollections, curatedCollectionNfts, nftMetadataCache } from '~/lib/db';
import { eq, and } from 'drizzle-orm';
import { getNFTMetadata } from '~/lib/alchemy';

// POST /api/admin/refresh-metadata - Bulk refresh metadata for a collection (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminFid, collectionId } = body;

    if (!adminFid || !collectionId) {
      return NextResponse.json(
        { success: false, error: 'Missing adminFid or collectionId' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Verify admin
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.fid, adminFid))
      .limit(1);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - not an admin' },
        { status: 403 }
      );
    }

    // Get collection
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

    // Get all NFTs in collection
    const nfts = await db
      .select()
      .from(curatedCollectionNfts)
      .where(eq(curatedCollectionNfts.curatedCollectionId, collectionId));

    const results = [];
    const errors = [];

    // Refresh metadata for each NFT
    for (const nft of nfts) {
      try {
        const metadata = await getNFTMetadata(nft.contractAddress, nft.tokenId);
        if (metadata) {
          const [updated] = await db
            .update(nftMetadataCache)
            .set({
              name: metadata.name || null,
              description: metadata.description || null,
              imageURI: metadata.imageURI || null,
              animationURI: metadata.animationURI || null,
              attributes: metadata.attributes || null,
              tokenURI: metadata.tokenURI || null,
              metadataSource: 'alchemy',
              refreshedAt: new Date(),
            })
            .where(
              and(
                eq(nftMetadataCache.contractAddress, nft.contractAddress),
                eq(nftMetadataCache.tokenId, nft.tokenId)
              )
            )
            .returning();

          if (!updated) {
            // Create if doesn't exist
            await db.insert(nftMetadataCache).values({
              contractAddress: nft.contractAddress,
              tokenId: nft.tokenId,
              name: metadata.name || null,
              description: metadata.description || null,
              imageURI: metadata.imageURI || null,
              animationURI: metadata.animationURI || null,
              attributes: metadata.attributes || null,
              tokenURI: metadata.tokenURI || null,
              metadataSource: 'alchemy',
              refreshedAt: new Date(),
            });
          }

          results.push({ contractAddress: nft.contractAddress, tokenId: nft.tokenId, success: true });
        } else {
          errors.push({ contractAddress: nft.contractAddress, tokenId: nft.tokenId, error: 'Failed to fetch metadata' });
        }
      } catch (error) {
        errors.push({ contractAddress: nft.contractAddress, tokenId: nft.tokenId, error: String(error) });
      }
    }

    return NextResponse.json({
      success: true,
      refreshed: results.length,
      errors: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error refreshing collection metadata:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh collection metadata' },
      { status: 500 }
    );
  }
}

