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

const songNotes: Record<string, number[]> = {
  "Thunderstruck": [130, 164, 196, 246],
  "Lose Yourself": [110, 147, 220, 294],
  "Seven Nation Army": [98, 147, 196, 220],
  "All I Do Is Win": [164, 220, 277, 330],
  "Power": [123, 185, 247, 370],
  "Can't Hold Us": [147, 196, 294, 392],
  "Sirius": [146, 185, 220, 294],
  "Welcome to the Jungle": [110, 165, 220, 330],
  "HUMBLE.": [92, 138, 185, 277],
  "Till I Collapse": [98, 147, 196, 294],
  "Remember the Name": [123, 164, 246, 329],
  "We Will Rock You": [82, 123, 164, 246],
  "Started From the Bottom": [104, 156, 208, 312],
  "Eye of the Tiger": [131, 196, 262, 392],
  "Jump Around": [147, 220, 294, 440],
};

const demoWalkUpUrls = new Map<string, string>();

export function createDemoWalkUpUrl(songName?: string | null) {
  const key = songName ?? "LeagueVerse Demo";
  const cached = demoWalkUpUrls.get(key);
  if (cached) return cached;

  const notes = songNotes[key] ?? [146, 196, 246, 329];
  const sampleRate = 44100;
  const seconds = 4;
  const sampleCount = Math.floor(sampleRate * seconds);
  const dataSize = sampleCount * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleRate;
    const noteIndex = Math.floor((t / seconds) * notes.length) % notes.length;
    const frequency = notes[noteIndex] ?? 220;
    const beat = Math.sin(2 * Math.PI * 2 * t) > -0.15 ? 1 : 0.52;
    const introFade = Math.min(1, t * 6);
    const outroFade = Math.min(1, (seconds - t) * 4);
    const envelope = introFade * outroFade;
    const lead = Math.sin(2 * Math.PI * frequency * t);
    const octave = 0.38 * Math.sin(2 * Math.PI * frequency * 2 * t);
    const bass = 0.32 * Math.sin(2 * Math.PI * (frequency / 2) * t);
    const sample = Math.max(-1, Math.min(1, (lead + octave + bass) * envelope * beat * 0.34));
    view.setInt16(44 + i * 2, Math.round(sample * 32767), true);
  }

  const url = URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
  demoWalkUpUrls.set(key, url);
  return url;
}

export function getResolvedWalkUpAudio(songName?: string | null, customUrl?: string | null) {
  if (isPlayableAudioUrl(customUrl)) return { url: customUrl as string, label: "Actual song preview URL" };
  const catalogPreviewUrl = getWalkUpSongPreviewUrl(songName);
  if (catalogPreviewUrl) return { url: catalogPreviewUrl, label: `Licensed preview for ${songName}` };
  if (songName) return { url: createDemoWalkUpUrl(songName), label: `Demo preview for ${songName}` };
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
  return !!url && /^(https?:\/\/|data:audio\/|blob:)/i.test(url);
}
