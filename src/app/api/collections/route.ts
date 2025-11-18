import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, suchGalleryUsers, curatedCollections } from '~/lib/db';
import { eq, and } from 'drizzle-orm';
import { getNeynarUser } from '~/lib/neynar';

// GET /api/collections - Get collections for a curator (or all published)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const curatorFid = searchParams.get('curatorFid');
    const publishedOnly = searchParams.get('publishedOnly') === 'true';

    const db = getDatabase();
    let query = db.select().from(curatedCollections);

    if (curatorFid) {
      query = query.where(eq(curatedCollections.curatorFid, parseInt(curatorFid)));
    } else if (publishedOnly) {
      query = query.where(eq(curatedCollections.isPublished, true));
    }

    const collections = await query;

    return NextResponse.json({
      success: true,
      collections: collections.map(c => ({
        id: c.id,
        curatorFid: c.curatorFid,
        title: c.title,
        slug: c.slug,
        isPublished: c.isPublished,
        description: c.description,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST /api/collections - Create a new collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { curatorFid, title, slug, description, isPublished } = body;

    if (!curatorFid || !title || !slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user exists or create them
    const db = getDatabase();
    const [existingUser] = await db
      .select()
      .from(suchGalleryUsers)
      .where(eq(suchGalleryUsers.fid, curatorFid))
      .limit(1);

    if (!existingUser) {
      await db.insert(suchGalleryUsers).values({
        fid: curatorFid,
      });
    }

    // Check if slug already exists for this curator
    const [existingCollection] = await db
      .select()
      .from(curatedCollections)
      .where(
        and(
          eq(curatedCollections.curatorFid, curatorFid),
          eq(curatedCollections.slug, slug)
        )
      )
      .limit(1);

    if (existingCollection) {
      return NextResponse.json(
        { success: false, error: 'Collection with this slug already exists' },
        { status: 409 }
      );
    }

    const [newCollection] = await db
      .insert(curatedCollections)
      .values({
        curatorFid,
        title,
        slug,
        description: description || null,
        isPublished: isPublished || false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      collection: {
        id: newCollection.id,
        curatorFid: newCollection.curatorFid,
        title: newCollection.title,
        slug: newCollection.slug,
        isPublished: newCollection.isPublished,
        description: newCollection.description,
        createdAt: newCollection.createdAt.toISOString(),
        updatedAt: newCollection.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}

