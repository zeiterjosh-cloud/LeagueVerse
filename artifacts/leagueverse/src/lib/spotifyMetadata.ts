export type SpotifyTrackMetadata = {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
};

export const spotifyMetadataCatalog: SpotifyTrackMetadata[] = [
  { id: "spotify-thunderstruck", title: "Thunderstruck", artist: "AC/DC", albumArt: "https://picsum.photos/seed/leagueverse-thunderstruck/300/300", spotifyUrl: "https://open.spotify.com/search/Thunderstruck%20AC%2FDC" },
  { id: "spotify-lose-yourself", title: "Lose Yourself", artist: "Eminem", albumArt: "https://picsum.photos/seed/leagueverse-lose-yourself/300/300", spotifyUrl: "https://open.spotify.com/search/Lose%20Yourself%20Eminem" },
  { id: "spotify-seven-nation-army", title: "Seven Nation Army", artist: "The White Stripes", albumArt: "https://picsum.photos/seed/leagueverse-seven-nation-army/300/300", spotifyUrl: "https://open.spotify.com/search/Seven%20Nation%20Army%20The%20White%20Stripes" },
  { id: "spotify-all-i-do-is-win", title: "All I Do Is Win", artist: "DJ Khaled", albumArt: "https://picsum.photos/seed/leagueverse-all-i-do-is-win/300/300", spotifyUrl: "https://open.spotify.com/search/All%20I%20Do%20Is%20Win%20DJ%20Khaled" },
  { id: "spotify-power", title: "Power", artist: "Kanye West", albumArt: "https://picsum.photos/seed/leagueverse-power/300/300", spotifyUrl: "https://open.spotify.com/search/Power%20Kanye%20West" },
  { id: "spotify-cant-hold-us", title: "Can't Hold Us", artist: "Macklemore & Ryan Lewis", albumArt: "https://picsum.photos/seed/leagueverse-cant-hold-us/300/300", spotifyUrl: "https://open.spotify.com/search/Can%27t%20Hold%20Us%20Macklemore%20Ryan%20Lewis" },
  { id: "spotify-sirius", title: "Sirius", artist: "The Alan Parsons Project", albumArt: "https://picsum.photos/seed/leagueverse-sirius/300/300", spotifyUrl: "https://open.spotify.com/search/Sirius%20The%20Alan%20Parsons%20Project" },
  { id: "spotify-welcome-to-the-jungle", title: "Welcome to the Jungle", artist: "Guns N' Roses", albumArt: "https://picsum.photos/seed/leagueverse-jungle/300/300", spotifyUrl: "https://open.spotify.com/search/Welcome%20to%20the%20Jungle%20Guns%20N%27%20Roses" },
  { id: "spotify-humble", title: "HUMBLE.", artist: "Kendrick Lamar", albumArt: "https://picsum.photos/seed/leagueverse-humble/300/300", spotifyUrl: "https://open.spotify.com/search/HUMBLE.%20Kendrick%20Lamar" },
  { id: "spotify-till-i-collapse", title: "Till I Collapse", artist: "Eminem", albumArt: "https://picsum.photos/seed/leagueverse-till-i-collapse/300/300", spotifyUrl: "https://open.spotify.com/search/Till%20I%20Collapse%20Eminem" },
];

export function searchSpotifyMetadata(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return spotifyMetadataCatalog.slice(0, 5);
  return spotifyMetadataCatalog.filter((track) => (
    track.title.toLowerCase().includes(normalized)
    || track.artist.toLowerCase().includes(normalized)
  ));
}

export function getSpotifyMetadataForTitle(title?: string | null) {
  if (!title) return null;
  return spotifyMetadataCatalog.find((track) => track.title.toLowerCase() === title.toLowerCase()) ?? null;
}
