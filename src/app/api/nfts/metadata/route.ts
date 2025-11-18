import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, nftMetadataCache } from '~/lib/db';
import { eq, and } from 'drizzle-orm';
import { getNFTMetadata } from '~/lib/alchemy';

// GET /api/nfts/metadata?contractAddress=...&tokenId=... - Get cached or fetch NFT metadata
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get('contractAddress');
    const tokenId = searchParams.get('tokenId');

    if (!contractAddress || !tokenId) {
      return NextResponse.json(
        { success: false, error: 'Missing contractAddress or tokenId' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const normalizedAddress = contractAddress.toLowerCase();

    // Check cache first
    const [cached] = await db
      .select()
      .from(nftMetadataCache)
      .where(
        and(
          eq(nftMetadataCache.contractAddress, normalizedAddress),
          eq(nftMetadataCache.tokenId, tokenId)
        )
      )
      .limit(1);

    if (cached) {
      return NextResponse.json({
        success: true,
        metadata: {
          contractAddress: cached.contractAddress,
          tokenId: cached.tokenId,
          name: cached.name,
          description: cached.description,
          imageURI: cached.imageURI,
          animationURI: cached.animationURI,
          attributes: cached.attributes,
          tokenURI: cached.tokenURI,
          metadataSource: cached.metadataSource,
          cachedAt: cached.cachedAt.toISOString(),
          refreshedAt: cached.refreshedAt?.toISOString(),
        },
        fromCache: true,
      });
    }

    // Fetch from Alchemy
    const metadata = await getNFTMetadata(normalizedAddress, tokenId);
    if (!metadata) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch NFT metadata' },
        { status: 404 }
      );
    }

    // Cache it
    const [newCache] = await db
      .insert(nftMetadataCache)
      .values({
        contractAddress: normalizedAddress,
        tokenId: tokenId,
        name: metadata.name || null,
        description: metadata.description || null,
        imageURI: metadata.imageURI || null,
        animationURI: metadata.animationURI || null,
        attributes: metadata.attributes || null,
        tokenURI: metadata.tokenURI || null,
        metadataSource: 'alchemy',
      })
      .returning();

    return NextResponse.json({
      success: true,
      metadata: {
        contractAddress: newCache.contractAddress,
        tokenId: newCache.tokenId,
        name: newCache.name,
        description: newCache.description,
        imageURI: newCache.imageURI,
        animationURI: newCache.animationURI,
        attributes: newCache.attributes,
        tokenURI: newCache.tokenURI,
        metadataSource: newCache.metadataSource,
        cachedAt: newCache.cachedAt.toISOString(),
        refreshedAt: newCache.refreshedAt?.toISOString(),
      },
      fromCache: false,
    });
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch NFT metadata' },
      { status: 500 }
    );
  }
}

// POST /api/nfts/metadata/refresh - Manually refresh NFT metadata
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractAddress, tokenId } = body;

    if (!contractAddress || !tokenId) {
      return NextResponse.json(
        { success: false, error: 'Missing contractAddress or tokenId' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const normalizedAddress = contractAddress.toLowerCase();

    // Fetch fresh metadata
    const metadata = await getNFTMetadata(normalizedAddress, tokenId);
    if (!metadata) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch NFT metadata' },
        { status: 404 }
      );
    }

    // Update cache
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
          eq(nftMetadataCache.contractAddress, normalizedAddress),
          eq(nftMetadataCache.tokenId, tokenId)
        )
      )
      .returning();

    if (!updated) {
      // Create if doesn't exist
      const [newCache] = await db
        .insert(nftMetadataCache)
        .values({
          contractAddress: normalizedAddress,
          tokenId: tokenId,
          name: metadata.name || null,
          description: metadata.description || null,
          imageURI: metadata.imageURI || null,
          animationURI: metadata.animationURI || null,
          attributes: metadata.attributes || null,
          tokenURI: metadata.tokenURI || null,
          metadataSource: 'alchemy',
          refreshedAt: new Date(),
        })
        .returning();

      return NextResponse.json({
        success: true,
        metadata: {
          contractAddress: newCache.contractAddress,
          tokenId: newCache.tokenId,
          name: newCache.name,
          description: newCache.description,
          imageURI: newCache.imageURI,
          animationURI: newCache.animationURI,
          attributes: newCache.attributes,
          tokenURI: newCache.tokenURI,
          metadataSource: newCache.metadataSource,
          cachedAt: newCache.cachedAt.toISOString(),
          refreshedAt: newCache.refreshedAt?.toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      metadata: {
        contractAddress: updated.contractAddress,
        tokenId: updated.tokenId,
        name: updated.name,
        description: updated.description,
        imageURI: updated.imageURI,
        animationURI: updated.animationURI,
        attributes: updated.attributes,
        tokenURI: updated.tokenURI,
        metadataSource: updated.metadataSource,
        cachedAt: updated.cachedAt.toISOString(),
        refreshedAt: updated.refreshedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error refreshing NFT metadata:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh NFT metadata' },
      { status: 500 }
    );
  }
}

