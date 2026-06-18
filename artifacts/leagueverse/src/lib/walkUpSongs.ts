export type WalkUpSongOption = {
  title: string;
  artist: string;
  category: "Stadium" | "Hip-Hop" | "Rock" | "Pop" | "Victory" | "Underdog";
  vibe: string;
  previewUrl: string | null;
};

const demoMp3Urls = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
];

export const walkUpSongOptions: WalkUpSongOption[] = [
  { title: "Thunderstruck", artist: "AC/DC", category: "Rock", vibe: "Electric entrance", previewUrl: demoMp3Urls[0] },
  { title: "Lose Yourself", artist: "Eminem", category: "Hip-Hop", vibe: "Clutch moment", previewUrl: demoMp3Urls[1] },
  { title: "Seven Nation Army", artist: "The White Stripes", category: "Stadium", vibe: "Crowd chant", previewUrl: demoMp3Urls[2] },
  { title: "All I Do Is Win", artist: "DJ Khaled", category: "Victory", vibe: "Championship flex", previewUrl: demoMp3Urls[3] },
  { title: "Power", artist: "Kanye West", category: "Hip-Hop", vibe: "Boss mode", previewUrl: demoMp3Urls[4] },
  { title: "Can't Hold Us", artist: "Macklemore & Ryan Lewis", category: "Pop", vibe: "Fast break energy", previewUrl: demoMp3Urls[5] },
  { title: "Sirius", artist: "The Alan Parsons Project", category: "Stadium", vibe: "Classic arena intro", previewUrl: demoMp3Urls[6] },
  { title: "Welcome to the Jungle", artist: "Guns N' Roses", category: "Rock", vibe: "Intimidation", previewUrl: demoMp3Urls[7] },
  { title: "HUMBLE.", artist: "Kendrick Lamar", category: "Hip-Hop", vibe: "Cold confidence", previewUrl: demoMp3Urls[8] },
  { title: "Till I Collapse", artist: "Eminem", category: "Underdog", vibe: "Never quit", previewUrl: demoMp3Urls[9] },
  { title: "Remember the Name", artist: "Fort Minor", category: "Underdog", vibe: "Legacy builder", previewUrl: demoMp3Urls[10] },
  { title: "We Will Rock You", artist: "Queen", category: "Stadium", vibe: "Stomp clap anthem", previewUrl: demoMp3Urls[11] },
  { title: "Started From the Bottom", artist: "Drake", category: "Underdog", vibe: "Rise-up story", previewUrl: demoMp3Urls[12] },
  { title: "Eye of the Tiger", artist: "Survivor", category: "Rock", vibe: "Comeback fight", previewUrl: demoMp3Urls[13] },
  { title: "Jump Around", artist: "House of Pain", category: "Stadium", vibe: "Party kickoff", previewUrl: demoMp3Urls[14] },
];

export const walkUpSongCategories = ["All", "Stadium", "Hip-Hop", "Rock", "Pop", "Victory", "Underdog"] as const;

export type WalkUpSongCategoryFilter = (typeof walkUpSongCategories)[number];

export function getWalkUpSongOption(title?: string | null) {
  return walkUpSongOptions.find((song) => song.title === title) ?? null;
}

export function getWalkUpSongLabel(title?: string | null) {
  const song = getWalkUpSongOption(title);
  return song ? `${song.title} - ${song.artist}` : title ?? "No song selected";
}

export function getWalkUpSongPreviewUrl(title?: string | null) {
  return getWalkUpSongOption(title)?.previewUrl ?? null;
}

export function getDefaultWalkUpSongUrl(title?: string | null) {
  return getWalkUpSongPreviewUrl(title) ?? demoMp3Urls[0];
}

export function getResolvedWalkUpAudio(songName?: string | null, customUrl?: string | null) {
  if (isPlayableAudioUrl(customUrl)) return { url: customUrl as string, label: "Actual song preview URL" };
  const catalogPreviewUrl = getWalkUpSongPreviewUrl(songName);
  if (catalogPreviewUrl) return { url: catalogPreviewUrl, label: `Licensed preview for ${songName}` };
  return { url: getDefaultWalkUpSongUrl("Thunderstruck"), label: "Default LeagueVerse demo MP3" };
}

export async function playWalkUpPreview(songName?: string | null, customUrl?: string | null) {
  const source = getResolvedWalkUpAudio(songName, customUrl);
  if (!source) throw new Error("No walk-up audio source is available.");
  const audio = new Audio(source.url);
  audio.volume = 0.9;
  await audio.play();
  return source;
}

export function filterWalkUpSongs(filter: WalkUpSongCategoryFilter, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  return walkUpSongOptions.filter((song) => {
    const matchesFilter = filter === "All" || song.category === filter;
    const matchesQuery = !normalizedQuery
      || song.title.toLowerCase().includes(normalizedQuery)
      || song.artist.toLowerCase().includes(normalizedQuery)
      || song.vibe.toLowerCase().includes(normalizedQuery);
    return matchesFilter && matchesQuery;
  });
}

export function isPlayableAudioUrl(url?: string | null) {
  if (!url) return false;
  if (/^(blob:|data:audio\/)/i.test(url)) return true;
  return /^https?:\/\/.+\.(mp3|wav|ogg)(\?.*)?$/i.test(url);
}
