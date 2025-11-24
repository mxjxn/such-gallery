import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDatabase, nftMetadataCache, curatedGalleryNfts, curatedGalleries } from '~/lib/db';
import { eq, and } from 'drizzle-orm';
import { getNeynarUser } from '~/lib/neynar';
import { APP_URL, APP_NAME } from '~/lib/constants';
import { NFTActions } from './NFTActions';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ contractAddress: string; tokenId: string }>;
}): Promise<Metadata> {
  const { contractAddress, tokenId } = await params;
  const normalizedAddress = contractAddress.toLowerCase();

  const db = getDatabase();
  const [cached] = await db
    .select()
    .from(nftMetadataCache)
    .where(eq(nftMetadataCache.contractAddress, normalizedAddress))
    .limit(1);

  if (!cached) {
    return {
      title: 'NFT Not Found',
    };
  }

  const ogImageUrl = `${APP_URL}/api/opengraph-image?contractAddress=${contractAddress}&tokenId=${tokenId}`;

  return {
    title: `${cached.name || `NFT #${tokenId}`} | ${APP_NAME}`,
    description: cached.description || `NFT from ${contractAddress}`,
    openGraph: {
      title: cached.name || `NFT #${tokenId}`,
      description: cached.description || undefined,
      images: cached.imageURI ? [cached.imageURI, ogImageUrl] : [ogImageUrl],
      url: `${APP_URL}/nfts/${contractAddress}/${tokenId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: cached.name || `NFT #${tokenId}`,
      description: cached.description || undefined,
      images: cached.imageURI ? [cached.imageURI, ogImageUrl] : [ogImageUrl],
    },
  };
}

export default async function NFTPage({
  params,
}: {
  params: Promise<{ contractAddress: string; tokenId: string }>;
}) {
  const { contractAddress, tokenId } = await params;
  const normalizedAddress = contractAddress.toLowerCase();

  const db = getDatabase();
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

  if (!cached) {
    notFound();
  }

  // Get gallery info if NFT is in a gallery
  const [galleryNft] = await db
    .select()
    .from(curatedGalleryNfts)
    .where(
      and(
        eq(curatedGalleryNfts.contractAddress, normalizedAddress),
        eq(curatedGalleryNfts.tokenId, tokenId)
      )
    )
    .limit(1);

  let gallery = null;
  let curator = null;

  if (galleryNft) {
    const [galleryData] = await db
      .select()
      .from(curatedGalleries)
      .where(eq(curatedGalleries.id, galleryNft.curatedGalleryId))
      .limit(1);

    if (galleryData) {
      gallery = galleryData;
      curator = await getNeynarUser(galleryData.curatorFid);
    }
  }

  return (
    <div className="container-wide py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* NFT Image */}
        <div>
          {cached.imageURI ? (
            <img
              src={cached.imageURI}
              alt={cached.name || 'NFT'}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </div>

        {/* NFT Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4">
            {cached.name || `NFT #${tokenId}`}
          </h1>

          {cached.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {cached.description}
            </p>
          )}

          {gallery && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">From Gallery</p>
              <a
                href={`/collections/${gallery.id}`}
                className="text-primary hover:underline font-semibold"
              >
                {gallery.title}
              </a>
              {curator && (
                <p className="text-sm text-gray-500 mt-1">
                  Curated by {curator.display_name || curator.username}
                </p>
              )}
            </div>
          )}

          {galleryNft?.curatorComment && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-semibold mb-2">Curator's Note</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {galleryNft.curatorComment}
              </p>
            </div>
          )}

          {/* Actions - Purchase, Bid, Quote-cast */}
          <NFTActions
            contractAddress={contractAddress}
            tokenId={tokenId}
            curatorFid={gallery?.curatorFid}
          />

          {/* NFT Details */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Contract</dt>
                <dd className="font-mono text-xs break-all">{contractAddress}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Token ID</dt>
                <dd className="font-mono">{tokenId}</dd>
              </div>
              {cached.tokenURI && (
                <div className="col-span-2">
                  <dt className="text-gray-500">Token URI</dt>
                  <dd className="font-mono text-xs break-all">
                    <a
                      href={cached.tokenURI}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {cached.tokenURI}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

