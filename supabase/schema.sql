-- SupabaseのSQL Editorでこのファイルの内容をそのまま実行してください。

create table if not exists feeds (
  id bigint generated always as identity primary key,
  name text not null,
  url text not null unique,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists articles (
  id bigint generated always as identity primary key,
  feed_id bigint references feeds (id) on delete set null,
  title text not null,
  link text not null unique,
  source_name text,
  published_at timestamptz,
  summary text,
  created_at timestamptz not null default now()
);

create index if not exists articles_published_at_idx on articles (published_at desc);

-- 初期フィード（Yahoo!ニュース トピックス）。
-- 後からフィードを追加したい場合は、このテーブルに1行追加するだけでOK（アプリ側の変更不要）。
insert into feeds (name, url) values
  ('Yahoo!ニュース - 主要', 'https://news.yahoo.co.jp/rss/topics/top-picks.xml'),
  ('Yahoo!ニュース - 国内', 'https://news.yahoo.co.jp/rss/topics/domestic.xml'),
  ('Yahoo!ニュース - 国際', 'https://news.yahoo.co.jp/rss/topics/world.xml'),
  ('Yahoo!ニュース - 経済', 'https://news.yahoo.co.jp/rss/topics/business.xml'),
  ('Yahoo!ニュース - IT', 'https://news.yahoo.co.jp/rss/topics/it.xml')
on conflict (url) do nothing;
