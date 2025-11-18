import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDatabase, curatedCollections, curatedCollectionNfts, nftMetadataCache } from '~/lib/db';
import { eq } from 'drizzle-orm';
import { getNeynarUser } from '~/lib/neynar';
import { APP_URL, APP_NAME } from '~/lib/constants';
import { CollectionActions } from './CollectionActions';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const collectionId = parseInt(id);

  const db = getDatabase();
  const [collection] = await db
    .select()
    .from(curatedCollections)
    .where(eq(curatedCollections.id, collectionId))
    .limit(1);

  if (!collection) {
    return {
      title: 'Collection Not Found',
    };
  }

  const curator = await getNeynarUser(collection.curatorFid);
  const ogImageUrl = `${APP_URL}/api/opengraph-image?collectionId=${collectionId}`;

  return {
    title: `${collection.title} | ${APP_NAME}`,
    description: collection.description || `Curated collection by ${curator?.display_name || curator?.username || 'Unknown'}`,
    openGraph: {
      title: collection.title,
      description: collection.description || undefined,
      images: [ogImageUrl],
      url: `${APP_URL}/collections/${collectionId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: collection.title,
      description: collection.description || undefined,
      images: [ogImageUrl],
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collectionId = parseInt(id);

  const db = getDatabase();
  const [collection] = await db
    .select()
    .from(curatedCollections)
    .where(eq(curatedCollections.id, collectionId))
    .limit(1);

  if (!collection) {
    notFound();
  }

  const nfts = await db
    .select()
    .from(curatedCollectionNfts)
    .where(eq(curatedCollectionNfts.curatedCollectionId, collectionId));

  // Get NFT metadata for display
  const nftsWithMetadata = await Promise.all(
    nfts.map(async (nft) => {
      const [cached] = await db
        .select()
        .from(nftMetadataCache)
        .where(
          eq(nftMetadataCache.contractAddress, nft.contractAddress.toLowerCase())
        )
        .limit(1);

      return {
        ...nft,
        metadata: cached || null,
      };
    })
  );

  const curator = await getNeynarUser(collection.curatorFid);

  return (
    <div className="container-wide py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{collection.title}</h1>
        {collection.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            {collection.description}
          </p>
        )}
        {curator && (
          <p className="text-sm text-gray-500">
            Curated by {curator.display_name || curator.username}
          </p>
        )}
      </div>

      {/* Quote-cast button and referral info */}
      <CollectionActions
        collectionId={collectionId}
        curatorFid={collection.curatorFid}
      />

      {/* NFTs in collection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nftsWithMetadata.map((nft) => (
          <div key={`${nft.contractAddress}-${nft.tokenId}`} className="card p-4">
            {nft.metadata?.imageURI && (
              <img
                src={nft.metadata.imageURI}
                alt={nft.metadata.name || 'NFT'}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-xl font-semibold mb-2">
              {nft.metadata?.name || `NFT #${nft.tokenId}`}
            </h3>
            {nft.curatorComment && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {nft.curatorComment}
              </p>
            )}
            <a
              href={`/nfts/${nft.contractAddress}/${nft.tokenId}`}
              className="text-primary hover:underline"
            >
              View NFT →
            </a>
          </div>
        ))}
      </div>

      {nftsWithMetadata.length === 0 && (
        <p className="text-center text-gray-500 py-12">
          No NFTs in this collection yet.
        </p>
      )}
    </div>
  );
}

