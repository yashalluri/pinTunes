import { NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

export async function POST(request: Request) {
  // Add validation for Pinata keys
  if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
    console.error('Pinata API keys are not configured');
    return NextResponse.json({ 
      success: false, 
      error: 'Pinata configuration is missing' 
    });
  }

  const body = await request.json();

  // Example: Storing user information on IPFS
  if (body.action === 'signup') {
    if (!body.username || !body.email || !body.password) {
      return NextResponse.json({ success: false, error: 'Missing required fields' });
    }

    const userData = {
      username: body.username,
      email: body.email,
      password: body.password, // This should be hashed in production!
    };

    try {
      // Test Pinata connection
      try {
        await pinata.testAuthentication();
      } catch (authError) {
        console.error('Pinata authentication failed:', authError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to authenticate with Pinata' 
        });
      }

      const result = await pinata.pinJSONToIPFS(userData);
      return NextResponse.json({ success: true, cid: result.IpfsHash });
    } catch (error: any) {
      console.error('Error uploading to Pinata:', error);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to store user data: ${error.message || 'Unknown error'}` 
      });
    }
  }

  if (body.action === 'login') {
    if (!body.email || !body.password) {
      return NextResponse.json({ success: false, error: 'Missing required fields' });
    }

    if (!body.cid) {
      return NextResponse.json({ success: false, error: 'No user data found. Please sign up first.' });
    }

    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${body.cid}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      const userData = await response.json();

      if (userData.email === body.email && userData.password === body.password) {
        // Don't send password back to client
        const { password, ...safeUserData } = userData;
        return NextResponse.json({ 
          success: true, 
          user: safeUserData
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid email or password' 
        });
      }
    } catch (error: any) {
      console.error('Error fetching from Pinata:', error);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to fetch user data: ${error.message}` 
      });
    }
  }

  return NextResponse.json({ success: false, error: 'Invalid action' });
}
