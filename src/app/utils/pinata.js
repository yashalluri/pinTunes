const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

export async function getPinataData(userId) {
  try {
    const response = await fetch(
      `https://api.pinata.cloud/data/pinList?status=pinned&metadata[keyvalues][userId]=${userId}`,
      {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        }
      }
    );
    
    const data = await response.json();
    return data.rows;
  } catch (error) {
    console.error('Error fetching Pinata data:', error);
    return [];
  }
}
