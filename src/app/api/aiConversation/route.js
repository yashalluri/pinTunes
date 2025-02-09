import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getMockSpotifyData } from "../../utils/spotify";

// Initialize the model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Helper function to get user data
async function getUserData(cid) {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    if (!response.ok) throw new Error('Failed to fetch user data');
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Helper function to create personalized context
async function createUserContext(userData, spotifyData) {
  const context = `User Profile:
- Username: ${userData.username}
- Favorite Artists: ${spotifyData.topArtists.join(', ')}
- Preferred Genres: ${spotifyData.topGenres.join(', ')}
- Recent Tracks: ${spotifyData.recentlyPlayed.map(track => `${track.title} by ${track.artist}`).join(', ')}
- Playlists: ${spotifyData.playlists.map(p => p.name).join(', ')}`;

  return context;
}

const SYSTEM_PROMPT = `You are a knowledgeable and friendly music personal assistant. You can:
- Recommend songs and artists based on user preferences
- Explain music theory concepts
- Share interesting facts about songs, artists, and genres
- Help users discover new music based on their current favorites
- Discuss music history and cultural impact
- Provide information about instruments and music production
- Create themed playlists based on moods, occasions, or genres

Please keep responses concise and focused on music-related topics.`;

export async function POST(req) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not configured");
    return NextResponse.json(
      { error: "API configuration error" },
      { status: 500 }
    );
  }

  try {
    const { messages, userCID } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    try {
      // Get user data and Spotify data
      const userData = await getUserData(userCID);
      const spotifyData = await getMockSpotifyData(userCID);
      
      // Create personalized context
      const userContext = await createUserContext(userData, spotifyData);
      
      // Start a new chat with combined context
      const chat = model.startChat({
        history: [],
        generationConfig: {
          temperature: 0.7,
        },
      });
      
      // Send the user's message with context
      const lastMessage = messages[messages.length - 1];
      const messageText = messages.length === 1 
        ? `${SYSTEM_PROMPT}\n\n${userContext}\n\nPlease greet ${userData.username} and you don't acknowledge their music taste. Keep your introduction short.`
        : lastMessage.text;

      const result = await chat.sendMessage(messageText);
      const response = await result.response.text();

      return NextResponse.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      return NextResponse.json(
        { error: "Failed to get response from AI" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "There was an error processing your request." },
      { status: 500 }
    );
  }
} 