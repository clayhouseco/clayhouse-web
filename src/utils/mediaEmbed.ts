export type MediaEmbed =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "vimeo"; embedUrl: string }
  | { kind: "spotify"; embedUrl: string }
  | { kind: "anchor"; embedUrl: string }
  | { kind: "video-file"; src: string }
  | { kind: "audio-file"; src: string };

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v") || u.pathname.split("/").pop() || null;
    }
  } catch {
    return null;
  }
  return null;
}

function vimeoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("vimeo.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.pop() ?? null;
  } catch {
    return null;
  }
  return null;
}

export function resolveVideoEmbed(url: string): MediaEmbed | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/") || trimmed.endsWith(".mp4") || trimmed.endsWith(".webm")) {
    return { kind: "video-file", src: trimmed };
  }

  const yt = youtubeId(trimmed);
  if (yt) {
    return {
      kind: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt}`,
    };
  }

  const vimeo = vimeoId(trimmed);
  if (vimeo) {
    return { kind: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeo}` };
  }

  return null;
}

export function resolveAudioEmbed(url: string): MediaEmbed | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/") || trimmed.endsWith(".mp3") || trimmed.endsWith(".m4a")) {
    return { kind: "audio-file", src: trimmed };
  }

  try {
    const u = new URL(trimmed);
    if (u.hostname.includes("open.spotify.com")) {
      const path = u.pathname.replace("/embed", "");
      const embedPath = path.startsWith("/embed") ? path : `/embed${path}`;
      return { kind: "spotify", embedUrl: `https://open.spotify.com${embedPath}` };
    }
    if (u.hostname.includes("anchor.fm") || u.hostname.includes("podcasts.apple.com")) {
      return { kind: "anchor", embedUrl: trimmed };
    }
  } catch {
    return null;
  }

  return null;
}
