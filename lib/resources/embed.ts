import { ResourceType, ResourceSource, EmbedDescriptor } from './types';

const APPROVED_EMBED_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'docs.google.com',
  'drive.google.com',
];

export interface YouTubeParseResult {
  videoId?: string;
  playlistId?: string;
  startSeconds?: number;
}

/**
 * Extracts and validates YouTube video IDs, playlist IDs, and timestamps.
 * Supports standard watch, short URLs, embeds, shorts, live streams, and playlists.
 */
export function parseYouTubeId(rawUrl: string): YouTubeParseResult | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();

  // Handle direct 11-char video ID input
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { videoId: trimmed };
  }

  // Handle direct playlist ID input (e.g. PL..., OLAK..., etc.)
  if (/^PL[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { playlistId: trimmed };
  }

  let url: URL;
  try {
    const candidate = trimmed.startsWith('//')
      ? `https:${trimmed}`
      : !trimmed.startsWith('http://') && !trimmed.startsWith('https://')
      ? `https://${trimmed}`
      : trimmed;
    url = new URL(candidate);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  let videoId: string | undefined;
  let playlistId: string | undefined;
  let startSeconds: number | undefined;

  // Check timestamp in query (t or start parameter)
  const tParam = url.searchParams.get('t') || url.searchParams.get('start');
  if (tParam) {
    const matchSeconds = tParam.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);
    if (matchSeconds) {
      const hours = parseInt(matchSeconds[1] || '0', 10);
      const minutes = parseInt(matchSeconds[2] || '0', 10);
      const seconds = parseInt(matchSeconds[3] || '0', 10);
      const total = hours * 3600 + minutes * 60 + seconds;
      if (total > 0) startSeconds = total;
    } else {
      const parsed = parseInt(tParam, 10);
      if (!Number.isNaN(parsed) && parsed > 0) startSeconds = parsed;
    }
  }

  // Check playlist parameter
  const listParam = url.searchParams.get('list');
  if (listParam && /^[a-zA-Z0-9_-]+$/.test(listParam)) {
    playlistId = listParam;
  }

  if (hostname === 'youtu.be') {
    const pathname = url.pathname.replace(/^\/+/, '').split('/')[0];
    if (pathname && /^[a-zA-Z0-9_-]{11}$/.test(pathname)) {
      videoId = pathname;
    }
  } else if (
    hostname === 'youtube.com' ||
    hostname === 'm.youtube.com' ||
    hostname === 'youtube-nocookie.com'
  ) {
    if (url.pathname === '/watch') {
      const v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        videoId = v;
      }
    } else if (url.pathname.startsWith('/embed/')) {
      const parts = url.pathname.replace(/^\/embed\//, '').split('/');
      const first = parts[0];
      if (first === 'videoseries') {
        // videoseries embed; playlistId extracted from query
      } else if (first && /^[a-zA-Z0-9_-]{11}$/.test(first)) {
        videoId = first;
      }
    } else if (url.pathname.startsWith('/shorts/')) {
      const id = url.pathname.replace(/^\/shorts\//, '').split('/')[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        videoId = id;
      }
    } else if (url.pathname.startsWith('/live/')) {
      const id = url.pathname.replace(/^\/live\//, '').split('/')[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        videoId = id;
      }
    } else if (url.pathname.startsWith('/v/')) {
      const id = url.pathname.replace(/^\/v\//, '').split('/')[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        videoId = id;
      }
    } else if (url.pathname === '/playlist') {
      // Playlist only URL; listParam extracted above
    }
  }

  if (!videoId && !playlistId) return null;
  return { videoId, playlistId, startSeconds };
}

/**
 * Builds a secure youtube-nocookie embed URL with safe parameters.
 * Supports single videos, videos with playlists, and standalone playlist embed decks.
 */
export function buildYouTubeEmbedUrl(
  videoId?: string | null,
  startSeconds?: number,
  playlistId?: string | null
): string {
  if (videoId) {
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
    });
    if (startSeconds && startSeconds > 0) {
      params.set('start', String(startSeconds));
    }
    if (playlistId) {
      params.set('list', playlistId);
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  }

  if (playlistId) {
    const params = new URLSearchParams({
      list: playlistId,
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
    });
    return `https://www.youtube-nocookie.com/embed/videoseries?${params.toString()}`;
  }

  return '';
}

/**
 * Parses Google Docs, Google Slides, Google Sheets, or Google Drive URLs and returns
 * the appropriate embed/preview URL.
 */
export function parseGoogleDriveEmbedUrl(rawUrl: string): { embedUrl: string; kind: 'slide' | 'doc' | 'file' } | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');

  if (hostname === 'docs.google.com') {
    // Google Presentation / Slides
    const slideMatch = url.pathname.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (slideMatch?.[1]) {
      const id = slideMatch[1];
      return {
        embedUrl: `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000`,
        kind: 'slide',
      };
    }

    // Google Document
    const docMatch = url.pathname.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docMatch?.[1]) {
      const id = docMatch[1];
      return {
        embedUrl: `https://docs.google.com/document/d/${id}/preview`,
        kind: 'doc',
      };
    }

    // Google Spreadsheet
    const sheetMatch = url.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (sheetMatch?.[1]) {
      const id = sheetMatch[1];
      return {
        embedUrl: `https://docs.google.com/spreadsheets/d/${id}/preview`,
        kind: 'doc',
      };
    }
  }

  if (hostname === 'drive.google.com') {
    // drive.google.com/file/d/FILE_ID/view
    const fileMatch = url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch?.[1]) {
      const id = fileMatch[1];
      return {
        embedUrl: `https://drive.google.com/file/d/${id}/preview`,
        kind: 'file',
      };
    }

    // drive.google.com/open?id=FILE_ID
    const openId = url.searchParams.get('id');
    if (openId && /^[a-zA-Z0-9_-]+$/.test(openId)) {
      return {
        embedUrl: `https://drive.google.com/file/d/${openId}/preview`,
        kind: 'file',
      };
    }
  }

  return null;
}

/**
 * Validates that an iframe URL belongs strictly to approved domains.
 */
export function isSafeEmbedUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/') && !url.startsWith('//')) {
    // Internal site-relative path
    return true;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    return APPROVED_EMBED_DOMAINS.some(
      (approved) => hostname === approved || hostname.endsWith(`.${approved}`)
    );
  } catch {
    return false;
  }
}

/**
 * Detects the resource descriptor, embed URL, and capabilities for any given resource.
 */
export function getResourceEmbedDescriptor(params: {
  title: string;
  fileUrl: string;
  resourceType?: ResourceType;
  sourceType?: ResourceSource;
  fileType?: string;
}): EmbedDescriptor {
  const { title, fileUrl, resourceType, sourceType, fileType } = params;
  const url = fileUrl.trim();

  // 1. YouTube Detection
  const ytParsed = parseYouTubeId(url);
  if (ytParsed || sourceType === 'YOUTUBE') {
    if (ytParsed && (ytParsed.videoId || ytParsed.playlistId)) {
      return {
        kind: 'youtube',
        embedUrl: buildYouTubeEmbedUrl(ytParsed.videoId, ytParsed.startSeconds, ytParsed.playlistId),
        originalUrl: url,
        title,
        isEmbeddable: true,
        requiresExternalFallback: false,
      };
    }
    // YouTube source selected but invalid link
    return {
      kind: 'youtube',
      originalUrl: url,
      title,
      isEmbeddable: false,
      requiresExternalFallback: true,
      fallbackMessage: 'Invalid YouTube link format. Open directly on YouTube.',
    };
  }

  // 2. Google Drive / Docs / Slides Detection
  const googleDriveParsed = parseGoogleDriveEmbedUrl(url);
  if (googleDriveParsed || sourceType === 'GOOGLE_DRIVE') {
    if (googleDriveParsed) {
      return {
        kind:
          googleDriveParsed.kind === 'slide'
            ? 'google_slide'
            : googleDriveParsed.kind === 'doc'
            ? 'google_doc'
            : 'google_drive_file',
        embedUrl: googleDriveParsed.embedUrl,
        originalUrl: url,
        title,
        isEmbeddable: true,
        requiresExternalFallback: false,
      };
    }
    return {
      kind: 'google_drive_file',
      originalUrl: url,
      title,
      isEmbeddable: false,
      requiresExternalFallback: true,
      fallbackMessage: 'Open presentation or document in Google Drive.',
    };
  }

  // 3. Hosted / Uploaded Video (e.g. .mp4, .webm, .ogg)
  const isVideoFile =
    resourceType === 'VIDEO' ||
    /\.(mp4|webm|ogg|m4v)(\?.*)?$/i.test(url) ||
    fileType?.toLowerCase() === 'mp4' ||
    fileType?.toLowerCase() === 'webm';
  if (isVideoFile) {
    return {
      kind: 'html5_video',
      embedUrl: url,
      originalUrl: url,
      title,
      isEmbeddable: true,
      requiresExternalFallback: false,
    };
  }

  // 4. PDF Document
  const isPdf =
    /\.pdf(\?.*)?$/i.test(url) ||
    fileType?.toLowerCase() === 'pdf' ||
    (resourceType === 'DOCUMENT' && /\.pdf/i.test(url));
  if (isPdf) {
    return {
      kind: 'pdf',
      embedUrl: url,
      originalUrl: url,
      title,
      isEmbeddable: true,
      requiresExternalFallback: false,
    };
  }

  // 5. Downloadable Dataset / File
  const isFile =
    resourceType === 'FILE' ||
    /\.(csv|xlsx|xls|zip|pbix|ipynb|json|sql|parquet|tsv|docx|txt)(\?.*)?$/i.test(url);
  if (isFile) {
    return {
      kind: 'download_file',
      originalUrl: url,
      title,
      isEmbeddable: false,
      requiresExternalFallback: false,
    };
  }

  // 6. Generic Link / External Website
  return {
    kind: 'external_link',
    originalUrl: url,
    title,
    isEmbeddable: false,
    requiresExternalFallback: true,
    fallbackMessage: 'Opens external website.',
  };
}

/**
 * Infers default resourceType and sourceType from a URL.
 */
export function inferResourceMetaFromUrl(url: string): {
  resourceType: ResourceType;
  sourceType: ResourceSource;
  suggestedFileType: string;
} {
  const trimmed = (url || '').trim();

  if (parseYouTubeId(trimmed)) {
    return { resourceType: 'VIDEO', sourceType: 'YOUTUBE', suggestedFileType: 'youtube' };
  }

  const google = parseGoogleDriveEmbedUrl(trimmed);
  if (google) {
    return {
      resourceType: 'DOCUMENT',
      sourceType: 'GOOGLE_DRIVE',
      suggestedFileType: google.kind === 'slide' ? 'pptx' : 'pdf',
    };
  }

  if (/\.(mp4|webm|ogg|m4v)(\?.*)?$/i.test(trimmed)) {
    return { resourceType: 'VIDEO', sourceType: 'UPLOAD', suggestedFileType: 'mp4' };
  }

  if (/\.pdf(\?.*)?$/i.test(trimmed)) {
    return { resourceType: 'DOCUMENT', sourceType: 'UPLOAD', suggestedFileType: 'pdf' };
  }

  if (/\.(csv|xlsx|xls|zip|pbix|ipynb|json|sql|parquet|tsv|docx|txt)(\?.*)?$/i.test(trimmed)) {
    const extMatch = trimmed.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
    return {
      resourceType: 'FILE',
      sourceType: 'UPLOAD',
      suggestedFileType: extMatch ? extMatch[1].toLowerCase() : 'file',
    };
  }

  return { resourceType: 'LINK', sourceType: 'EXTERNAL', suggestedFileType: 'link' };
}
