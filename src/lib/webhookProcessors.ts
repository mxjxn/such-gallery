import { parseSuchGalleryUrl } from './quoteCast';
import { getUserEthAddress } from './neynar';
import { APP_URL } from './constants';
import { getDatabase, quoteCasts, suchGalleryUsers } from './db';
import { eq } from 'drizzle-orm';

interface CastData {
  hash: string;
  author: {
    fid: number;
  };
  parent_url?: string | null;
  text?: string;
  mentioned_profiles?: Array<{ fid: number }>;
}

/**
 * Process a quote-cast webhook event
 */
export async function processQuoteCastWebhook(castData: CastData): Promise<{
  success: boolean;
  quoteCastId?: number;
  error?: string;
}> {
  try {
    const parentUrl = castData.parent_url;
    if (!parentUrl) {
      return { success: false, error: 'No parent_url in cast' };
    }

    // Check if parent URL is a such.gallery URL
    if (!parentUrl.includes(APP_URL.replace('https://', '').replace('http://', ''))) {
      return { success: false, error: 'Not a such.gallery URL' };
    }

    // Parse the URL
    const parsed = parseSuchGalleryUrl(parentUrl);
    if (!parsed.type) {
      return { success: false, error: 'Could not parse such.gallery URL' };
    }

    // Get curator's ETH address
    const referralAddress = await getUserEthAddress(castData.author.fid);
    if (!referralAddress) {
      return { success: false, error: 'Could not get curator ETH address' };
    }

    // Create quote-cast record directly in database
    const db = getDatabase();

    // Ensure user exists
    const [existingUser] = await db
      .select()
      .from(suchGalleryUsers)
      .where(eq(suchGalleryUsers.fid, castData.author.fid))
      .limit(1);

    if (!existingUser) {
      await db.insert(suchGalleryUsers).values({
        fid: castData.author.fid,
        ethAddress: referralAddress,
      });
    } else if (!existingUser.ethAddress) {
      await db
        .update(suchGalleryUsers)
        .set({ ethAddress: referralAddress })
        .where(eq(suchGalleryUsers.fid, castData.author.fid));
    }

    const [newQuoteCast] = await db
      .insert(quoteCasts)
      .values({
        curatorFid: castData.author.fid,
        castHash: castData.hash,
        targetType: parsed.type,
        targetCollectionId: parsed.collectionId || null,
        targetContractAddress: parsed.contractAddress?.toLowerCase() || null,
        targetTokenId: parsed.tokenId || null,
        referralAddress: referralAddress.toLowerCase(),
      })
      .returning();

    return {
      success: true,
      quoteCastId: newQuoteCast.id,
    };
  } catch (error) {
    console.error('Error processing quote-cast webhook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process a mention webhook event
 */
export async function processMentionWebhook(castData: CastData): Promise<{
  success: boolean;
  mentionedFids?: number[];
  error?: string;
}> {
  try {
    const mentionedProfiles = castData.mentioned_profiles || [];
    const mentionedFids = mentionedProfiles.map((p) => p.fid);

    // Check if the mention is related to such.gallery content
    // This could be enhanced to check if mentioned users are curators, etc.
    const text = castData.text || '';
    const isSuchGalleryRelated = text.includes('such.gallery') || 
                                  text.includes('such gallery') ||
                                  mentionedFids.length > 0;

    if (!isSuchGalleryRelated) {
      return { success: false, error: 'Not related to such.gallery' };
    }

    // For now, we just track mentions
    // In the future, this could trigger notifications or other actions
    return {
      success: true,
      mentionedFids,
    };
  } catch (error) {
    console.error('Error processing mention webhook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

