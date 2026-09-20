-- SupabaseのSQL Editorでこのファイルの内容をそのまま実行してください。
-- 既にテーブルがある場合も安全に再実行できます（不足している列・テーブルだけが追加されます）。

create table if not exists feeds (
  id bigint generated always as identity primary key,
  name text not null,
  url text not null unique,
  enabled boolean not null default true,
  category text,
  created_at timestamptz not null default now()
);
alter table feeds add column if not exists category text;

create table if not exists articles (
  id bigint generated always as identity primary key,
  feed_id bigint references feeds (id) on delete set null,
  title text not null,
  link text not null unique,
  source_name text,
  published_at timestamptz,
  summary text,
  category text,
  created_at timestamptz not null default now()
);
alter table articles add column if not exists category text;

-- キーワード一致セクション表示用のキーワード一覧
create table if not exists keywords (
  id bigint generated always as identity primary key,
  keyword text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists articles_published_at_idx on articles (published_at desc);
create index if not exists articles_category_idx on articles (category);

-- 初期フィード（Yahoo!ニュース トピックス）。
-- categoryは記事一覧のカテゴリバッジ・絞り込みに使われる（AIによる自動判定ではなく、フィード単位の固定値）。
-- 後からフィードを追加したい場合は、このテーブルに1行追加するだけでOK（アプリ側の変更不要）。
insert into feeds (name, url, category) values
  ('Yahoo!ニュース - 主要', 'https://news.yahoo.co.jp/rss/topics/top-picks.xml', null),
  ('Yahoo!ニュース - 国内', 'https://news.yahoo.co.jp/rss/topics/domestic.xml', '国内'),
  ('Yahoo!ニュース - 国際', 'https://news.yahoo.co.jp/rss/topics/world.xml', '国際'),
  ('Yahoo!ニュース - 経済', 'https://news.yahoo.co.jp/rss/topics/business.xml', '経済'),
  ('Yahoo!ニュース - IT', 'https://news.yahoo.co.jp/rss/topics/it.xml', 'IT')
on conflict (url) do nothing;

-- 既に上記フィードが登録済みだった場合、categoryを後から補完する
update feeds set category = '国内' where url = 'https://news.yahoo.co.jp/rss/topics/domestic.xml' and category is null;
update feeds set category = '国際' where url = 'https://news.yahoo.co.jp/rss/topics/world.xml' and category is null;
update feeds set category = '経済' where url = 'https://news.yahoo.co.jp/rss/topics/business.xml' and category is null;
update feeds set category = 'IT' where url = 'https://news.yahoo.co.jp/rss/topics/it.xml' and category is null;
