import { NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

export async function POST(request: Request) {
  const body = await request.json();

  // Example: Storing user information on IPFS
  if (body.action === 'signup') {
    const userData = {
      username: body.username,
      email: body.email,
      password: body.password, // This should be hashed in production!
    };

    try {
      const result = await pinata.pinJSONToIPFS(userData);
      return NextResponse.json({ success: true, cid: result.IpfsHash });
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      return NextResponse.json({ success: false, error: 'Failed to store user data' });
    }
  }

  if (body.action === 'login') {
    // You can fetch user data from IPFS using its CID (stored during signup)
    const cid = body.cid; // Pass the CID from frontend or database
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      const userData = await response.json();

      if (userData.email === body.email && userData.password === body.password) {
        return NextResponse.json({ success: true, user: userData });
      } else {
        return NextResponse.json({ success: false, error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error fetching from Pinata:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch user data' });
    }
  }

  return NextResponse.json({ success: false, error: 'Invalid action' });
}
