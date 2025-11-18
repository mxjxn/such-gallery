import { NextRequest, NextResponse } from 'next/server';
import { processQuoteCastWebhook, processMentionWebhook } from '~/lib/webhookProcessors';

/**
 * Handle Neynar webhook events for quote-casts and mentions
 * 
 * Configure this endpoint in Neynar developer portal:
 * - Target URL: https://such.gallery/api/webhooks/neynar
 * - Subscribe to: cast.created events
 * - Filter by: parent_url containing such.gallery (for quote-casts)
 *              or mentions of such.gallery-related content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Neynar webhook format
    const eventType = body.type;
    const eventData = body.data;

    if (eventType !== 'cast.created') {
      return NextResponse.json({
        success: false,
        error: 'Unsupported event type',
      }, { status: 400 });
    }

    // Check if this is a quote-cast (has parent_url)
    if (eventData.parent_url) {
      const result = await processQuoteCastWebhook({
        hash: eventData.hash,
        author: eventData.author,
        parent_url: eventData.parent_url,
        text: eventData.text,
      });

      if (result.success) {
        return NextResponse.json({
          success: true,
          processed: 'quote_cast',
          quoteCastId: result.quoteCastId,
        });
      } else {
        // Don't fail the webhook if it's not a such.gallery quote-cast
        // Just log and return success
        console.log('Quote-cast processing skipped:', result.error);
        return NextResponse.json({
          success: true,
          processed: 'none',
          reason: result.error,
        });
      }
    }

    // Check if this is a mention
    if (eventData.mentioned_profiles && eventData.mentioned_profiles.length > 0) {
      const result = await processMentionWebhook({
        hash: eventData.hash,
        author: eventData.author,
        text: eventData.text,
        mentioned_profiles: eventData.mentioned_profiles,
      });

      if (result.success) {
        return NextResponse.json({
          success: true,
          processed: 'mention',
          mentionedFids: result.mentionedFids,
        });
      } else {
        // Don't fail the webhook if it's not related
        console.log('Mention processing skipped:', result.error);
        return NextResponse.json({
          success: true,
          processed: 'none',
          reason: result.error,
        });
      }
    }

    // Event not relevant to such.gallery
    return NextResponse.json({
      success: true,
      processed: 'none',
      reason: 'Not a quote-cast or mention',
    });
  } catch (error) {
    console.error('Error processing Neynar webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

