import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getDatabase, curatedCollections, curatedCollectionNfts, nftMetadataCache } from '~/lib/db';
import { eq } from 'drizzle-orm';
import { getNeynarUser } from '~/lib/neynar';
import { getNFTMetadata } from '~/lib/alchemy';
import { APP_NAME } from '~/lib/constants';

export const revalidate = 86400; // Cache for 24 hours
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const contractAddress = searchParams.get('contractAddress');
    const tokenId = searchParams.get('tokenId');
    const curatorFid = searchParams.get('curatorFid');

    const db = getDatabase();

    // Determine if this is a collection or NFT OG image
    if (collectionId) {
      // Collection OG image
      const collectionIdNum = parseInt(collectionId);
      const [collection] = await db
        .select()
        .from(curatedCollections)
        .where(eq(curatedCollections.id, collectionIdNum))
        .limit(1);

      if (!collection) {
        return new Response('Collection not found', { status: 404 });
      }

      // Get first NFT in collection
      const [firstNft] = await db
        .select()
        .from(curatedCollectionNfts)
        .where(eq(curatedCollectionNfts.curatedCollectionId, collectionIdNum))
        .limit(1);

      let nftImage: string | null = null;
      let nftName: string | null = null;

      if (firstNft) {
        // Get NFT metadata from cache or fetch
        const [cached] = await db
          .select()
          .from(nftMetadataCache)
          .where(
            eq(nftMetadataCache.contractAddress, firstNft.contractAddress.toLowerCase())
          )
          .limit(1);

        if (cached?.imageURI) {
          nftImage = cached.imageURI;
          nftName = cached.name || null;
        } else {
          // Fetch from Alchemy
          const metadata = await getNFTMetadata(
            firstNft.contractAddress,
            firstNft.tokenId
          );
          if (metadata?.imageURI) {
            nftImage = metadata.imageURI;
            nftName = metadata.name || null;
          }
        }
      }

      // Get curator info
      const curator = collection.curatorFid
        ? await getNeynarUser(collection.curatorFid)
        : null;

      return new ImageResponse(
        (
          <div
            tw="flex h-full w-full flex-col bg-gradient-to-br from-purple-600 to-blue-600"
            style={{ fontFamily: 'system-ui' }}
          >
            {/* Main content area */}
            <div tw="flex flex-col h-full w-full px-16 py-12">
              {/* Collection title */}
              <h1 tw="text-6xl font-bold text-white mb-4">
                {collection.title}
              </h1>

              {/* Curator info */}
              {curator && (
                <p tw="text-3xl text-white opacity-90 mb-8">
                  Curated by {curator.display_name || curator.username}
                </p>
              )}

              {/* NFT image or placeholder */}
              {nftImage ? (
                <div tw="flex items-center justify-center mt-8">
                  <img
                    src={nftImage}
                    alt={nftName || 'NFT'}
                    tw="w-96 h-96 object-cover rounded-lg border-4 border-white shadow-2xl"
                  />
                </div>
              ) : (
                <div tw="flex items-center justify-center mt-8">
                  <div tw="w-96 h-96 bg-white/20 rounded-lg border-4 border-white flex items-center justify-center">
                    <p tw="text-4xl text-white opacity-70">No NFTs yet</p>
                  </div>
                </div>
              )}

              {/* App branding */}
              <div tw="flex items-center mt-auto">
                <p tw="text-2xl text-white opacity-70">{APP_NAME}</p>
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers: {
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
          },
        }
      );
    } else if (contractAddress && tokenId) {
      // NFT OG image
      const normalizedAddress = contractAddress.toLowerCase();

      // Get NFT metadata
      const [cached] = await db
        .select()
        .from(nftMetadataCache)
        .where(
          eq(nftMetadataCache.contractAddress, normalizedAddress)
        )
        .limit(1);

      let nftImage: string | null = null;
      let nftName: string | null = null;
      let nftDescription: string | null = null;

      if (cached) {
        nftImage = cached.imageURI || null;
        nftName = cached.name || null;
        nftDescription = cached.description || null;
      } else {
        // Fetch from Alchemy
        const metadata = await getNFTMetadata(contractAddress, tokenId);
        if (metadata) {
          nftImage = metadata.imageURI || null;
          nftName = metadata.name || null;
          nftDescription = metadata.description || null;
        }
      }

      // Get collection info if available
      const [collectionNft] = await db
        .select()
        .from(curatedCollectionNfts)
        .where(
          eq(curatedCollectionNfts.contractAddress, normalizedAddress)
        )
        .limit(1);

      let collectionTitle: string | null = null;
      let curatorName: string | null = null;

      if (collectionNft) {
        const [collection] = await db
          .select()
          .from(curatedCollections)
          .where(eq(curatedCollections.id, collectionNft.curatedCollectionId))
          .limit(1);

        if (collection) {
          collectionTitle = collection.title;
          const curator = await getNeynarUser(collection.curatorFid);
          if (curator) {
            curatorName = curator.display_name || curator.username;
          }
        }
      }

      return new ImageResponse(
        (
          <div
            tw="flex h-full w-full flex-col bg-gradient-to-br from-purple-600 to-blue-600"
            style={{ fontFamily: 'system-ui' }}
          >
            <div tw="flex h-full w-full px-16 py-12">
              {/* Left side - NFT image */}
              <div tw="flex items-center justify-center w-1/2 pr-8">
                {nftImage ? (
                  <img
                    src={nftImage}
                    alt={nftName || 'NFT'}
                    tw="w-full h-full object-cover rounded-lg border-4 border-white shadow-2xl"
                  />
                ) : (
                  <div tw="w-full h-full bg-white/20 rounded-lg border-4 border-white flex items-center justify-center">
                    <p tw="text-4xl text-white opacity-70">NFT Image</p>
                  </div>
                )}
              </div>

              {/* Right side - NFT info */}
              <div tw="flex flex-col w-1/2 pl-8 justify-center">
                {nftName && (
                  <h1 tw="text-5xl font-bold text-white mb-4">
                    {nftName}
                  </h1>
                )}

                {collectionTitle && (
                  <p tw="text-3xl text-white opacity-90 mb-2">
                    From: {collectionTitle}
                  </p>
                )}

                {curatorName && (
                  <p tw="text-2xl text-white opacity-80 mb-4">
                    Curated by {curatorName}
                  </p>
                )}

                {nftDescription && (
                  <p tw="text-xl text-white opacity-70 line-clamp-3">
                    {nftDescription}
                  </p>
                )}

                {/* App branding */}
                <div tw="flex items-center mt-auto">
                  <p tw="text-2xl text-white opacity-70">{APP_NAME}</p>
                </div>
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers: {
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
          },
        }
      );
    } else {
      // Default OG image
      return new ImageResponse(
        (
          <div
            tw="flex h-full w-full flex-col justify-center items-center bg-gradient-to-br from-purple-600 to-blue-600"
            style={{ fontFamily: 'system-ui' }}
          >
            <h1 tw="text-6xl font-bold text-white mb-4">{APP_NAME}</h1>
            <p tw="text-3xl text-white opacity-90">An open gallery. Artists can submit their art, anyone can curate.</p>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }
  } catch (error) {
    console.error('Error generating OG image:', error);
    // Return a default error image
    return new ImageResponse(
      (
        <div
          tw="flex h-full w-full flex-col justify-center items-center bg-gray-900"
          style={{ fontFamily: 'system-ui' }}
        >
          <p tw="text-4xl text-white">Error loading image</p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}

