import { NextResponse } from 'next/server';
import PinataClient from '@pinata/sdk';

const pinata = new PinataClient({
  pinataApiKey: process.env.PINATA_API_KEY!,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY!,
});

export async function GET() {
  try {
    // Fetch posts from Pinata
    const filter = {
      status: 'pinned',
      metadata: {
        keyvalues: {
          type: {
            value: 'post',
            op: 'eq'
          }
        }
      }
    };
    const result = await pinata.pinList(filter);
    return NextResponse.json({ success: true, posts: result.rows });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, image } = body;

    // Upload image to Pinata if present
    let imageCID = null;
    if (image) {
      const imageResult = await pinata.pinFileToIPFS(image);
      imageCID = imageResult.IpfsHash;
    }

    // Create post object
    const postData = {
      text,
      imageCID,
      timestamp: new Date().toISOString(),
      type: 'post'
    };

    // Pin post data to IPFS
    const result = await pinata.pinJSONToIPFS(postData);

    return NextResponse.json({ success: true, cid: result.IpfsHash });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ success: false, error: 'Failed to create post' });
  }
}
