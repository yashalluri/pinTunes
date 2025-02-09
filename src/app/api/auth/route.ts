import { NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

export async function POST(request: Request) {
  if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
    console.error('Pinata API keys are not configured');
    return NextResponse.json({ 
      success: false, 
      error: 'Pinata configuration is missing' 
    });
  }

  const body = await request.json();

  // Handle signup
  if (body.action === 'signup') {
    if (!body.username || !body.email || !body.password) {
      return NextResponse.json({ success: false, error: 'Missing required fields' });
    }

    const userData = {
      username: body.username,
      email: body.email,
      password: body.password, // Should be hashed in production
      profile: {
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }
    };

    try {
      await pinata.testAuthentication();
      const result = await pinata.pinJSONToIPFS(userData);
      return NextResponse.json({ 
        success: true, 
        cid: result.IpfsHash 
      });
    } catch (error: any) {
      console.error('Error during signup:', error);
      return NextResponse.json({ 
        success: false, 
        error: `Signup failed: ${error.message || 'Unknown error'}` 
      });
    }
  }

  // Handle login
  if (body.action === 'login') {
    if (!body.email || !body.password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing email or password' 
      });
    }

    if (!body.cid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please sign up first' 
      });
    }

    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${body.cid}`);
      if (!response.ok) {
        throw new Error('Failed to authenticate user');
      }

      const userData = await response.json();

      if (userData.email === body.email && userData.password === body.password) {
        return NextResponse.json({ 
          success: true,
          cid: body.cid
        });
      }

      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    } catch (error: any) {
      console.error('Error during login:', error);
      return NextResponse.json({ 
        success: false, 
        error: `Login failed: ${error.message}` 
      });
    }
  }

  return NextResponse.json({ success: false, error: 'Invalid action' });
}
