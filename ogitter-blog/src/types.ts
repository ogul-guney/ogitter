export interface GitHubFileItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: string;
  _links?: {
    self: string;
    git: string;
    html: string;
  };
}

export interface Post {
  id: string; // usually filename or sha
  filename: string;
  title: string;
  rawMarkdown: string;
  htmlContent: string;
  excerpt: string;
  readingTimeMinutes: number;
  wordCount: number;
  size: number;
  githubUrl: string;
  downloadUrl: string;
  date?: string;
  tags?: string[];
}

export type ViewMode = 'list' | 'post';
