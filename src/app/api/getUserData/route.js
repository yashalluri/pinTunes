import { NextResponse } from "next/server";

// Helper function to fetch user data from Pinata
async function fetchUserData(cid) {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data from Pinata');
    }

    const userData = await response.json();
    // Remove sensitive data
    const { password, ...safeUserData } = userData;
    
    return {
      success: true,
      data: safeUserData
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      success: false,
      error: 'Failed to fetch user data'
    };
  }
}

export async function POST(request) {
  try {
    const { cid } = await request.json();

    if (!cid) {
      return NextResponse.json(
        { error: "No CID provided" },
        { status: 400 }
      );
    }

    const result = await fetchUserData(cid);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in getUserData:', error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
