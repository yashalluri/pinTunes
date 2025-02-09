"use client";

// import { createContext, useContext, useEffect, useState } from 'react';
// import { getPinataData } from '../utils/pinata';
// import { getMockSpotifyData } from '../utils/spotify';

// const UserContext = createContext();

// export function UserProvider({ children }) {
//   const [userContext, setUserContext] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchUserData() {
//       try {
//         // first gets user data
//         const userResponse = await fetch('/api/getUserData');
//         const userData = await userResponse.json();

//         // pinata data
//         const pinataData = await getPinataData(userData.id);

//         // spotify data in theory (idfk how this would work with real spot integration)
//         const spotifyData = await getMockSpotifyData(userData.id);

//         // combine everything
//         const combinedData = {
//           ...userData,
//           pinataData,
//           spotify: spotifyData,
//           lastUpdated: new Date().toISOString()
//         };

//         setUserContext(combinedData);
//       } catch (error) {
//         console.error('error fetching user data:', error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchUserData();
//   }, []);

//   return (
//     <UserContext.Provider value={{ userContext, loading }}>
//       {children}
//     </UserContext.Provider>
//   );
// }

// export function useUser() {
//   const context = useContext(UserContext);
//   if (context === undefined) {
//     throw new Error('useUser must be used within a UserProvider');
//   }
//   return context;
// }