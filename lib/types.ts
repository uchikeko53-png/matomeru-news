export type Feed = {
  id: number;
  name: string;
  url: string;
  enabled: boolean;
  created_at: string;
};

export type Article = {
  id: number;
  feed_id: number | null;
  title: string;
  link: string;
  source_name: string | null;
  published_at: string | null;
  summary: string | null;
  created_at: string;
};
