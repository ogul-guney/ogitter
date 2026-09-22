import { GitHubFileItem, Post } from '../types';
import {
  extractFrontmatter,
  derivePostTitle,
  renderMarkdownToHtml,
  createExcerpt,
  calculateReadingTime,
} from '../utils/markdown';

const OWNER = 'ogul-guney';
const REPO = 'ogitter';
const POSTS_PATH = 'posts';
const CACHE_KEY_PREFIX = 'ogitter_post_';
const CACHE_LIST_KEY = 'ogitter_posts_list_v1';

export interface FetchResult {
  posts: Post[];
  rateLimitRemaining?: number;
  rateLimitReset?: Date;
  error?: string;
  isFromCache?: boolean;
}

/**
 * Fetches all markdown files from the GitHub repository's posts directory
 */
export async function fetchBlogPosts(forceRefresh: boolean = false): Promise<FetchResult> {
  // Check localStorage cache if not forcing refresh
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CACHE_LIST_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { timestamp: number; posts: Post[] };
        // Valid for 10 minutes
        if (Date.now() - parsed.timestamp < 10 * 60 * 1000 && parsed.posts.length > 0) {
          return { posts: parsed.posts, isFromCache: true };
        }
      }
    } catch {
      // Ignore cache retrieval errors
    }
  }

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${POSTS_PATH}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const remaining = res.headers.get('x-ratelimit-remaining');
    const resetTime = res.headers.get('x-ratelimit-reset');
    const rateLimitRemaining = remaining ? parseInt(remaining, 10) : undefined;
    const rateLimitReset = resetTime ? new Date(parseInt(resetTime, 10) * 1000) : undefined;

    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        // Try fallback to cache
        const fallback = getFallbackCachedPosts();
        if (fallback.length > 0) {
          return {
            posts: fallback,
            isFromCache: true,
            rateLimitRemaining: 0,
            rateLimitReset,
            error:
              'GitHub API istek sınırı aşıldı. Önbelleğe alınmış yazılar gösteriliyor.',
          };
        }
        return {
          posts: [],
          rateLimitRemaining: 0,
          rateLimitReset,
          error:
            'GitHub API saatlik istek limiti (60 istek) aşıldı. Lütfen bir süre sonra tekrar deneyin.',
        };
      }

      if (res.status === 404) {
        return {
          posts: [],
          error: `'${OWNER}/${REPO}' deposunda '${POSTS_PATH}' klasörü bulunamadı.`,
        };
      }

      throw new Error(`GitHub API hatası: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      return { posts: [], error: 'Beklenmeyen API yanıtı: Klasör listesi alınamadı.' };
    }

    // Filter only .md files
    const mdFiles: GitHubFileItem[] = data.filter(
      (item: GitHubFileItem) =>
        item.type === 'file' && item.name.toLowerCase().endsWith('.md')
    );

    if (mdFiles.length === 0) {
      return { posts: [], rateLimitRemaining, rateLimitReset };
    }

    // Fetch and process markdown content for each file in parallel
    const postPromises = mdFiles.map(async (fileItem): Promise<Post> => {
      let rawMarkdown = '';
      const cacheKey = `${CACHE_KEY_PREFIX}${fileItem.sha}`;

      // Check per-file cache by sha
      if (!forceRefresh) {
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
          rawMarkdown = cachedRaw;
        }
      }

      if (!rawMarkdown) {
        // Priority 1: download_url
        // Priority 2: raw.githubusercontent.com
        const targetUrl =
          fileItem.download_url ||
          `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${fileItem.path}`;

        const rawRes = await fetch(targetUrl);
        if (!rawRes.ok) {
          throw new Error(`${fileItem.name} içeriği indirilemedi.`);
        }
        rawMarkdown = await rawRes.text();
        try {
          localStorage.setItem(cacheKey, rawMarkdown);
        } catch {
          // localStorage full or disabled
        }
      }

      // Parse frontmatter, title, and HTML
      const { title: fmTitle, date: fmDate, tags, cleanMarkdown } = extractFrontmatter(rawMarkdown);
      const title = derivePostTitle(fileItem.name, cleanMarkdown, fmTitle);
      const excerpt = createExcerpt(cleanMarkdown, 160);
      const htmlContent = await renderMarkdownToHtml(cleanMarkdown);
      const { minutes, wordCount } = calculateReadingTime(cleanMarkdown);

      return {
        id: fileItem.sha || fileItem.name,
        filename: fileItem.name,
        title,
        rawMarkdown,
        htmlContent,
        excerpt,
        readingTimeMinutes: minutes,
        wordCount,
        size: fileItem.size,
        githubUrl: fileItem.html_url,
        downloadUrl: fileItem.download_url || '',
        date: fmDate,
        tags,
      };
    });

    const posts = await Promise.all(postPromises);

    // Sort posts alphabetically or by date if present
    posts.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.title.localeCompare(b.title);
    });

    // Save list to cache
    try {
      localStorage.setItem(
        CACHE_LIST_KEY,
        JSON.stringify({ timestamp: Date.now(), posts })
      );
    } catch {
      // storage quota
    }

    return {
      posts,
      rateLimitRemaining,
      rateLimitReset,
      isFromCache: false,
    };
  } catch (err) {
    const fallback = getFallbackCachedPosts();
    if (fallback.length > 0) {
      return {
        posts: fallback,
        isFromCache: true,
        error:
          err instanceof Error
            ? `Bağlantı hatası: ${err.message}. Önbellekteki yazılar gösteriliyor.`
            : 'Yazılar yüklenirken bir hata oluştu. Önbellekteki yazılar gösteriliyor.',
      };
    }

    return {
      posts: [],
      error:
        err instanceof Error
          ? err.message
          : 'GitHub API üzerinden yazılar yüklenirken bilinmeyen bir hata oluştu.',
    };
  }
}

function getFallbackCachedPosts(): Post[] {
  try {
    const cached = localStorage.getItem(CACHE_LIST_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return Array.isArray(parsed.posts) ? parsed.posts : [];
    }
  } catch {
    // ignore
  }
  return [];
}
