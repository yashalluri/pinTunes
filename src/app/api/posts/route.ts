import { NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';
import { PinataPinOptions } from '@pinata/sdk';

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_API_SECRET!
);

interface PinataMetadataKeyValues {
  type?: string;
  postData?: string;
  value?: string;
  op?: string;
  [key: string]: string | undefined;
}

interface PinataMetadata {
  name?: string;
  keyvalues?: Record<string, string | { value: string; op: string }>;
}

interface PinataPinListResponse {
  rows: {
    id: string;
    ipfs_pin_hash: string;
    size: number;
    user_id: string;
    date_pinned: string;
    date_unpinned: string | null;
    metadata: PinataMetadata;
  }[];
  count: number;
}

export async function GET() {
  try {
    console.log('Fetching posts from Pinata...');
    const queryOptions = {
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
    
    const result = (await pinata.pinList(queryOptions)) as unknown as PinataPinListResponse;
    console.log('Pinata response:', result);

    const posts = result.rows
      .filter(pin => pin.metadata?.keyvalues?.type === 'post')
      .map(pin => {
        try {
          const postData = pin.metadata?.keyvalues?.postData
            ? JSON.parse(pin.metadata.keyvalues.postData as string)
            : {};
          
          return {
            id: pin.ipfs_pin_hash,
            ...postData
          };
        } catch (error) {
          console.error('Error parsing post data:', error);
          return null;
        }
      })
      .filter(Boolean);

    console.log('Processed posts:', posts);
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch posts' 
    });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const image = formData.get('image') as File;
    
    console.log('Starting POST request...'); // Debug log
    
    if (!content) {
      throw new Error('Content is required');
    }
    
    let imageHash = '';
    if (image && image.size > 0) {
      console.log('Processing image...'); // Debug log
      const buffer = await image.arrayBuffer();
      const imageStream = Buffer.from(buffer);
      
      const imageOptions = {
        pinataMetadata: {
          name: `image-${Date.now()}-${image.name}`
        }
      };
      
      const imageResult = await pinata.pinFileToIPFS(imageStream, imageOptions);
      imageHash = imageResult.IpfsHash;
      console.log('Image uploaded:', imageHash); // Debug log
    }

    const postData = {
      content,
      image: imageHash ? `https://gateway.pinata.cloud/ipfs/${imageHash}` : '',
      userId: 'user-id', // You might want to get this from your auth system
      username: 'username',
      timestamp: Date.now()
    };

    console.log('Creating post with data:', postData); // Debug log

    const options = {
      pinataMetadata: {
        name: `Post-${Date.now()}`,
        keyvalues: {
          type: 'post',
          postData: JSON.stringify(postData)
        } as any
      }
    };

    const result = await pinata.pinJSONToIPFS(postData, options);
    console.log('Post created successfully:', result); // Debug log

    return NextResponse.json({ 
      success: true, 
      post: { id: result.IpfsHash, ...postData }
    });
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create post' 
    }, { status: 500 });
  }
}