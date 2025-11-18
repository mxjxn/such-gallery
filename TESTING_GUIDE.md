# such.gallery Testing Guide

This guide walks you through testing the `such.gallery` Farcaster miniapp with real API interactions and database operations.

## Prerequisites

1. **Farcaster Account**: You need a Farcaster account with a FID (Farcaster ID)
2. **Database Setup**: PostgreSQL database with schema migrated
3. **Environment Variables**: All required API keys configured
4. **Base Mainnet NFT**: Have access to a Base Mainnet NFT contract address for testing

## Environment Setup

### Required Environment Variables

```bash
# Database
POSTGRES_URL=postgresql://user:password@localhost:5432/such_gallery

# Neynar (Farcaster API)
NEYNAR_API_KEY=your_neynar_api_key
NEYNAR_CLIENT_ID=your_neynar_client_id

# Alchemy (NFT Metadata)
ALCHEMY_API_KEY=your_alchemy_api_key

# App URL
NEXT_PUBLIC_URL=http://localhost:3000
```

### Database Migration

Before testing, ensure the database schema is up to date:

```bash
cd packages/db
pnpm db:push
```

## Component Features

The such.gallery app includes:

✅ **Collection Management**
- Create curated collections
- Update collection metadata (title, description, publish status)
- Delete collections (owner only)
- List collections (by curator or published only)

✅ **NFT Curation**
- Add NFTs to collections with curator comments
- Remove NFTs from collections
- Display NFT metadata with caching

✅ **Metadata Caching**
- Automatic metadata fetching from Alchemy
- Manual refresh for individual NFTs
- Bulk refresh for entire collections (admin only)

✅ **Sales Integration**
- Fetch LSSVM pool data
- Fetch Auctionhouse listing data
- Unified sales endpoint per contract

✅ **Quote-Cast Tracking**
- Track quote-casts for collections
- Track quote-casts for individual NFTs
- Store referral addresses for fee distribution

## Testing Steps

### 1. User Setup

First, you'll need a Farcaster FID. You can get this from:
- Your Farcaster account in Warpcast
- Neynar API: `GET https://api.neynar.com/v2/farcaster/user/by_username?username=your_username`

**Test FID**: Use your own FID for testing (typically a number like `12345`)

### 2. Create a Collection

**Endpoint**: `POST /api/collections`

**Request Body**:
```json
{
  "curatorFid": 12345,
  "title": "My Test Collection",
  "slug": "my-test-collection",
  "description": "A collection of amazing NFTs",
  "isPublished": false
}
```

**Expected Response**:
```json
{
  "success": true,
  "collection": {
    "id": 1,
    "curatorFid": 12345,
    "title": "My Test Collection",
    "slug": "my-test-collection",
    "isPublished": false,
    "description": "A collection of amazing NFTs",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation**:
- ✅ Requires `curatorFid`, `title`, and `slug`
- ✅ Slug must be unique per curator
- ✅ Automatically creates user if doesn't exist
- ❌ Returns 409 if slug already exists for curator

### 3. Fetch NFT Metadata

**Endpoint**: `GET /api/nfts/metadata?contractAddress=0x...&tokenId=1`

**Test NFT**: Use a known Base Mainnet NFT:
- Contract: `0x6302C5F1F2E3d0e4D5ae5aeB88bd8044c88Eef9A` (Base Sepolia test contract)
- Token ID: `1`

**Expected Response (First Call - Not Cached)**:
```json
{
  "success": true,
  "metadata": {
    "contractAddress": "0x6302c5f1f2e3d0e4d5ae5aeb88bd8044c88eef9a",
    "tokenId": "1",
    "name": "NFT Name",
    "description": "NFT Description",
    "imageURI": "https://...",
    "animationURI": null,
    "attributes": [...],
    "tokenURI": "https://...",
    "metadataSource": "alchemy",
    "cachedAt": "2024-01-01T00:00:00.000Z",
    "refreshedAt": null
  },
  "fromCache": false
}
```

**Expected Response (Second Call - Cached)**:
```json
{
  "success": true,
  "metadata": { ... },
  "fromCache": true
}
```

**Validation**:
- ✅ Fetches from Alchemy if not cached
- ✅ Returns cached data if available
- ✅ Normalizes contract address to lowercase
- ❌ Returns 400 if missing contractAddress or tokenId
- ❌ Returns 404 if NFT not found

### 4. Add NFT to Collection

**Endpoint**: `POST /api/collections/[id]/nfts`

**Request Body**:
```json
{
  "contractAddress": "0x6302C5F1F2E3d0e4D5ae5aeB88bd8044c88Eef9A",
  "tokenId": "1",
  "curatorComment": "This is an amazing piece!",
  "showDescription": true,
  "showAttributes": false
}
```

**Expected Response**:
```json
{
  "success": true,
  "nft": {
    "curatedCollectionId": 1,
    "contractAddress": "0x6302c5f1f2e3d0e4d5ae5aeb88bd8044c88eef9a",
    "tokenId": "1",
    "curatorComment": "This is an amazing piece!",
    "showDescription": true,
    "showAttributes": false,
    "addedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation**:
- ✅ Requires `contractAddress` and `tokenId`
- ✅ Prevents duplicate NFTs in same collection
- ✅ Optional `curatorComment`, `showDescription`, `showAttributes`
- ❌ Returns 404 if collection doesn't exist
- ❌ Returns 409 if NFT already in collection

### 5. Get Collection with NFTs

**Endpoint**: `GET /api/collections/[id]`

**Expected Response**:
```json
{
  "success": true,
  "collection": {
    "id": 1,
    "curatorFid": 12345,
    "title": "My Test Collection",
    "slug": "my-test-collection",
    "isPublished": false,
    "description": "A collection of amazing NFTs",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "nfts": [
    {
      "curatedCollectionId": 1,
      "contractAddress": "0x6302c5f1f2e3d0e4d5ae5aeb88bd8044c88eef9a",
      "tokenId": "1",
      "curatorComment": "This is an amazing piece!",
      "showDescription": true,
      "showAttributes": false,
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 6. Update Collection

**Endpoint**: `PUT /api/collections/[id]`

**Request Body**:
```json
{
  "curatorFid": 12345,
  "title": "Updated Collection Title",
  "description": "Updated description",
  "isPublished": true
}
```

**Validation**:
- ✅ Only collection owner can update
- ✅ Updates `updatedAt` timestamp
- ❌ Returns 403 if curatorFid doesn't match
- ❌ Returns 404 if collection doesn't exist

### 7. Refresh NFT Metadata

**Endpoint**: `POST /api/nfts/metadata/refresh`

**Request Body**:
```json
{
  "contractAddress": "0x6302C5F1F2E3d0e4D5ae5aeB88bd8044c88Eef9A",
  "tokenId": "1"
}
```

**Expected Response**:
```json
{
  "success": true,
  "metadata": {
    "contractAddress": "0x6302c5f1f2e3d0e4d5ae5aeb88bd8044c88eef9a",
    "tokenId": "1",
    "name": "Updated NFT Name",
    "description": "Updated description",
    "imageURI": "https://...",
    "metadataSource": "alchemy",
    "cachedAt": "2024-01-01T00:00:00.000Z",
    "refreshedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

**Validation**:
- ✅ Fetches fresh metadata from Alchemy
- ✅ Updates `refreshedAt` timestamp
- ✅ Creates cache entry if doesn't exist
- ❌ Returns 400 if missing contractAddress or tokenId
- ❌ Returns 404 if NFT not found

### 8. Bulk Refresh Collection Metadata (Admin Only)

**Endpoint**: `POST /api/admin/refresh-metadata`

**Prerequisites**: Admin FID must be added to `admin_users` table:
```sql
INSERT INTO admin_users (fid) VALUES (12345);
```

**Request Body**:
```json
{
  "adminFid": 12345,
  "collectionId": 1
}
```

**Expected Response**:
```json
{
  "success": true,
  "refreshed": 5,
  "errors": 0,
  "results": [
    { "contractAddress": "0x...", "tokenId": "1", "success": true },
    { "contractAddress": "0x...", "tokenId": "2", "success": true }
  ]
}
```

**Validation**:
- ✅ Requires admin FID in `admin_users` table
- ✅ Refreshes all NFTs in collection
- ✅ Returns success/error count
- ❌ Returns 403 if not admin
- ❌ Returns 404 if collection not found

### 9. Fetch Sales Data

**Endpoint**: `GET /api/sales/[contractAddress]`

**Test Contract**: Use a contract with active pools/listings

**Expected Response**:
```json
{
  "success": true,
  "pools": [
    {
      "poolAddress": "0x...",
      "nft": "0x...",
      "bondingCurve": "0x...",
      "spotPrice": "10000000000000000",
      "delta": "1000000000000000",
      "fee": "500",
      "ethBalance": "1000000000000000000"
    }
  ],
  "auctions": [
    {
      "listingId": "1",
      "seller": "0x...",
      "token": "0x...",
      "tokenId": "1",
      "reservePrice": "1000000000000000000",
      "buyNowPrice": "2000000000000000000"
    }
  ]
}
```

**Validation**:
- ✅ Fetches from unified indexer
- ✅ Returns both LSSVM pools and Auctionhouse listings
- ❌ Returns 404 if contract not found

### 10. Track Quote-Cast

**Endpoint**: `POST /api/quote-casts`

**Request Body** (Collection Quote-Cast):
```json
{
  "curatorFid": 12345,
  "castHash": "0xabc123...",
  "targetType": "collection",
  "targetCollectionId": 1,
  "referralAddress": "0x1234567890123456789012345678901234567890"
}
```

**Request Body** (NFT Quote-Cast):
```json
{
  "curatorFid": 12345,
  "castHash": "0xdef456...",
  "targetType": "nft",
  "targetContractAddress": "0x6302C5F1F2E3d0e4D5ae5aeB88bd8044c88Eef9A",
  "targetTokenId": "1",
  "referralAddress": "0x1234567890123456789012345678901234567890"
}
```

**Validation**:
- ✅ Requires `curatorFid`, `castHash`, `targetType`, `referralAddress`
- ✅ Validates target exists (collection or NFT)
- ✅ Stores referral address for fee distribution
- ❌ Returns 400 if missing required fields
- ❌ Returns 404 if target doesn't exist

## Testing Workflow

### Complete User Journey

1. **Create Collection**
   ```bash
   curl -X POST http://localhost:3000/api/collections \
     -H "Content-Type: application/json" \
     -d '{"curatorFid": 12345, "title": "Test", "slug": "test"}'
   ```

2. **Fetch NFT Metadata**
   ```bash
   curl "http://localhost:3000/api/nfts/metadata?contractAddress=0x6302C5F1F2E3d0e4D5ae5aeB88bd8044c88Eef9A&tokenId=1"
   ```

3. **Add NFT to Collection**
   ```bash
   curl -X POST http://localhost:3000/api/collections/1/nfts \
     -H "Content-Type: application/json" \
     -d '{"contractAddress": "0x6302C5F1F2E3d0e4D5ae5aeB88bd8044c88Eef9A", "tokenId": "1"}'
   ```

4. **Get Collection**
   ```bash
   curl http://localhost:3000/api/collections/1
   ```

5. **Publish Collection**
   ```bash
   curl -X PUT http://localhost:3000/api/collections/1 \
     -H "Content-Type: application/json" \
     -d '{"curatorFid": 12345, "isPublished": true}'
   ```

6. **Track Quote-Cast**
   ```bash
   curl -X POST http://localhost:3000/api/quote-casts \
     -H "Content-Type: application/json" \
     -d '{"curatorFid": 12345, "castHash": "0xabc123", "targetType": "collection", "targetCollectionId": 1, "referralAddress": "0x1234..."}'
   ```

## Troubleshooting

### "Missing required fields"
- Check that all required fields are included in request body
- Verify JSON is properly formatted
- Check Content-Type header is `application/json`

### "Collection with this slug already exists"
- Slugs must be unique per curator
- Try a different slug or delete the existing collection

### "Failed to fetch NFT metadata"
- Verify Alchemy API key is set correctly
- Check that contract address is on Base Mainnet
- Ensure token ID exists for the contract

### "Unauthorized - not an admin"
- Add your FID to `admin_users` table:
  ```sql
  INSERT INTO admin_users (fid) VALUES (12345);
  ```

### "Collection not found"
- Verify collection ID exists
- Check that you're using the correct collection ID
- Ensure collection hasn't been deleted

### Database Connection Issues
- Verify `POSTGRES_URL` is correct
- Check database is running
- Ensure schema is migrated: `cd packages/db && pnpm db:push`

### Neynar API Issues
- Verify `NEYNAR_API_KEY` is set
- Check API key has proper permissions
- Ensure rate limits aren't exceeded

## Testing Checklist

### Collection Management
- [ ] Create collection with all fields
- [ ] Create collection with minimal fields
- [ ] Create collection with duplicate slug (should fail)
- [ ] Get collection by ID
- [ ] List collections by curator
- [ ] List published collections only
- [ ] Update collection (as owner)
- [ ] Update collection (as non-owner - should fail)
- [ ] Delete collection (as owner)
- [ ] Delete collection (as non-owner - should fail)

### NFT Management
- [ ] Fetch NFT metadata (not cached)
- [ ] Fetch NFT metadata (cached)
- [ ] Add NFT to collection
- [ ] Add duplicate NFT to collection (should fail)
- [ ] Remove NFT from collection
- [ ] Refresh NFT metadata
- [ ] Bulk refresh collection metadata (as admin)
- [ ] Bulk refresh collection metadata (as non-admin - should fail)

### Sales Integration
- [ ] Fetch sales data for contract with pools
- [ ] Fetch sales data for contract with auctions
- [ ] Fetch sales data for contract with both
- [ ] Fetch sales data for contract with neither
- [ ] Get pool details
- [ ] Get listing details

### Quote-Cast Tracking
- [ ] Track collection quote-cast
- [ ] Track NFT quote-cast
- [ ] Track quote-cast with invalid collection (should fail)
- [ ] Track quote-cast with invalid NFT (should fail)
- [ ] List quote-casts by curator

## Related Documentation

- [such.gallery README](./README.md)
- [Database Schema](../../packages/db/src/schema.ts)
- [Unified Indexer](../../packages/unified-indexer/README.md)
- [Contract Addresses](../../CONTRACT_ADDRESSES.md)

