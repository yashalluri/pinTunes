export async function getMockSpotifyData(userId) {
    // Mock Spotify data
    return {
      topArtists: [
        "Justin Bieber",
        "Ed Sheeran", 
        "The Kid LAROI"
      ],
      topGenres: [
        "Pop",
        "R&B",
        "Dance Pop"
      ],
      recentlyPlayed: [
        { title: "Peaches", artist: "Justin Bieber" },
        { title: "Stay", artist: "The Kid LAROI & Justin Bieber" },
        { title: "Ghost", artist: "Justin Bieber" }
      ],
      playlists: [
        { name: "Pop Hits", genre: "Pop" },
        { name: "Chill R&B", genre: "R&B" },
        { name: "Dance Party", genre: "Dance Pop" }
      ]
    };
  }