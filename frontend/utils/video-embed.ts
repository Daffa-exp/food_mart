/**
 * Mengubah link YouTube/Vimeo biasa (yang dicopy dari address bar / tombol Share)
 * menjadi URL embed yang bisa dipakai di <iframe>. Dipakai untuk modal video
 * promo di homepage — diputar otomatis begitu modal dibuka (autoplay ini aman
 * dari blokir browser karena selalu dipicu oleh klik pengguna, jadi tidak
 * perlu di-mute seperti autoplay yang jalan sendiri tanpa interaksi).
 */
export function getVideoEmbedUrl(url: string): string | null {
  const base = parseEmbedBase(url);
  if (!base) return null;

  if (base.hostname.includes("youtube.com")) {
    base.searchParams.set("autoplay", "1");
    base.searchParams.set("playsinline", "1");
    base.searchParams.set("rel", "0"); // jangan rekomendasikan video channel lain saat selesai
  } else {
    base.searchParams.set("autoplay", "1");
  }

  return base.toString();
}

/**
 * Ambil ID video YouTube dari berbagai bentuk link (watch, youtu.be, shorts,
 * embed) supaya bisa dipakai untuk thumbnail. Vimeo tidak punya pola thumbnail
 * statis yang bisa ditebak begitu saja (perlu API), jadi tidak didukung di sini
 * — untuk banner video Vimeo, isi "Gambar Banner" di admin sebagai thumbnail.
 */
export function getYouTubeThumbnail(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    let id: string | null = null;

    if (host === "youtu.be") {
      id = parsed.pathname.slice(1) || null;
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") id = parsed.searchParams.get("v");
      else if (parsed.pathname.startsWith("/shorts/")) id = parsed.pathname.split("/")[2] ?? null;
      else if (parsed.pathname.startsWith("/embed/")) id = parsed.pathname.split("/")[2] ?? null;
    }

    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}

function parseEmbedBase(url: string): URL | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id ? new URL(`https://www.youtube.com/embed/${id}`) : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? new URL(`https://www.youtube.com/embed/${id}`) : null;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/")[2];
        return id ? new URL(`https://www.youtube.com/embed/${id}`) : null;
      }
      if (parsed.pathname.startsWith("/embed/")) return parsed;
      return null;
    }
    if (host === "vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? new URL(`https://player.vimeo.com/video/${id}`) : null;
    }
    if (host === "player.vimeo.com") return parsed;

    return null;
  } catch {
    return null;
  }
}
