# まとめるNewS

RSSで日々のニュースを収集して一覧表示する個人用Webアプリ。**完全無料で運用できる構成**（AIによる要約機能は現時点では未実装。将来Claude APIを使って追加可能）。

## 構成
- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase（Postgres、記事・フィードの保存先。無料枠で運用可能）
- GitHub Actions（1日2回、バッチ処理をキック。無料枠で運用可能）
- Vercel（ホスティング。無料枠で運用可能）
- 全ページBasic認証で保護（`middleware.ts`）

## 現在の状態
パソコン1（Node.jsインストール済み）で `npm install` 実施済み。以降のSupabase/Vercelセットアップを進めている段階。

## セットアップ手順

### 1. 依存パッケージのインストール
```
npm install
```

### 2. Supabaseにテーブルを作成
既存のSupabaseプロジェクトに相乗りする場合、新規プロジェクト作成は不要。
1. 対象のSupabaseプロジェクトのダッシュボードを開く
2. SQL Editorを開き、`supabase/schema.sql` の内容をそのまま実行（`feeds`・`articles`テーブルを追加＋Yahoo!ニュースRSSの初期データ投入。既存テーブルには影響しない）
3. Project Settings > API から `Project URL` と `service_role` キーを控える

### 3. 環境変数を設定
`.env.local.example` を `.env.local` にコピーして値を埋める。
- `CRON_SECRET` と `BASIC_AUTH_PASS` は自分で適当なランダム文字列を決めてよい

### 4. ローカルで動作確認
```
npm run dev
```
- http://localhost:3000 を開く（Basic認証はローカルでは環境変数未設定なら素通しなので、`.env.local`に値を入れていれば認証がかかる）
- バッチ処理を手動で1回叩いて記事が入るか確認:
```
curl -X POST http://localhost:3000/api/cron/fetch-news -H "x-cron-secret: <CRON_SECRETの値>"
```
- トップページを再読み込みして記事が表示されるか確認

### 5. GitHubにpush
```
git init
git add .
git commit -m "init: まとめるNewS"
```
GitHubで新規リポジトリを作成し、指示に従ってpushする。

### 6. Vercelにデプロイ
1. https://vercel.com でこのGitHubリポジトリをImport
2. Environment Variablesに `.env.local` と同じ内容（`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `CRON_SECRET` / `BASIC_AUTH_USER` / `BASIC_AUTH_PASS`）を設定
3. Deploy

### 7. GitHub Actionsの定期実行を有効化
GitHubリポジトリの Settings > Secrets and variables > Actions で以下を登録:
- `APP_URL`: VercelでデプロイされたURL（例: `https://matomeru-news.vercel.app`、末尾スラッシュなし）
- `CRON_SECRET`: Vercelに設定したものと同じ値

これで `.github/workflows/fetch-news.yml` が日本時間7時・19時に自動でバッチを実行する（手動実行はActionsタブの workflow_dispatch から可能）。

## ニュースソースを増やしたいとき
Supabaseの `feeds` テーブルに1行追加するだけ（アプリの再デプロイ不要）。
```sql
insert into feeds (name, url) values ('ソース名', 'RSSのURL');
```
特定のフィードだけ収集を止めたい場合は、対象フィードの `enabled` を `false` にすれば除外できる。

## 今後の拡張候補（今回は未実装）
- Claude APIによる記事の要約・カテゴリ分け（本格的に使い込みたくなったら追加。月あたり数百円程度の見込み）
- 複数ソースの類似記事をグルーピングして1本にまとめる機能
- カテゴリ・キーワードでの絞り込みUI
