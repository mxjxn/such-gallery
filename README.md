# such.gallery

An open gallery Farcaster miniapp. Artists can submit their art, anyone can curate.

## Features

- **Curation System**: Create and manage curated collections of NFTs
- **Quote-Cast Integration**: Share collections/NFTs via quote-casts with referral tracking
- **NFT Metadata Caching**: Automatic metadata caching with manual refresh
- **Sales Integration**: Display LSSVM pools and Auctionhouse listings
- **Farcaster Miniapp**: Full integration with Farcaster ecosystem via Neynar

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Farcaster signers via Neynar
- **NFT Data**: Alchemy API + metadata cache
- **Sales Data**: `@cryptoart/unified-indexer` (subgraphs)
- **UI**: Tailwind CSS

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
DATABASE_URL=postgresql://...
NEYNAR_API_KEY=...
ALCHEMY_API_KEY=...
NEXT_PUBLIC_URL=https://such.gallery
```

3. Run database migrations:
```bash
cd packages/db
pnpm db:push
```

4. Start development server:
```bash
pnpm dev
```

## API Routes

### Collections
- `GET /api/collections` - List collections
- `POST /api/collections` - Create collection
- `GET /api/collections/[id]` - Get collection with NFTs
- `PUT /api/collections/[id]` - Update collection
- `DELETE /api/collections/[id]` - Delete collection
- `POST /api/collections/[id]/nfts` - Add NFT to collection
- `DELETE /api/collections/[id]/nfts` - Remove NFT from collection

### NFT Metadata
- `GET /api/nfts/metadata` - Get cached or fetch NFT metadata
- `POST /api/nfts/metadata/refresh` - Manually refresh NFT metadata

### Quote-Casts
- `GET /api/quote-casts` - List quote-casts
- `POST /api/quote-casts` - Track a quote-cast

### Sales Data
- `GET /api/sales/[contractAddress]` - Get pools + auctions
- `GET /api/pools/[poolAddress]` - Get pool details
- `GET /api/listings/[listingId]` - Get listing details

### Admin
- `POST /api/admin/refresh-metadata` - Bulk refresh collection metadata

## Database Schema

See `packages/db/src/schema.ts` for the full schema. Key tables:
- `such_gallery_users` - User data (FID + optional wallet)
- `curated_collections` - User-created curation lists
- `curated_collection_nfts` - NFTs in collections with curator metadata
- `nft_metadata_cache` - Cached NFT metadata
- `quote_casts` - Quote-cast tracking for referrals
- `admin_users` - Admin FIDs

## Referral System

When a curator quote-casts a collection or NFT, the system tracks it with their wallet address. When users purchase via the quote-cast link, the referral address is passed to the Auctionhouse contract, and the curator receives a referral fee.
