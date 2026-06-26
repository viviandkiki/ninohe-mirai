# デプロイメントガイド

## 概要

ニノヘミライは **Vercel** へのデプロイを想定した Next.js 静的サイト（SSG）です。
独自ドメインは未接続でも動作します。後からドメイン追加可能な構成になっています。

---

## 初回デプロイ手順

### 1. Vercel アカウント準備

1. [vercel.com](https://vercel.com) でアカウント作成
2. GitHub リポジトリと連携

### 2. プロジェクト作成

```bash
# Vercel CLI でデプロイ（初回）
npx vercel
# → Framework: Next.js を選択
# → Root directory: ./ (デフォルト)
# → .vercel/project.json が生成される
```

または Vercel ダッシュボードから「Add New Project」→ リポジトリを選択。

### 3. 環境変数の設定

Vercel ダッシュボード「Settings → Environment Variables」で以下を設定してください。

| 変数名 | 値 | 備考 |
|--------|-----|------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` | 後からカスタムドメインに変更可 |
| `ESTAT_APP_ID` | e-Stat API キー | Build & Development のみ不要 |
| `RESAS_API_KEY` | RESAS API キー | Build & Development のみ不要 |

### 4. GitHub Secrets の設定

自動デプロイを使う場合（任意）、GitHub リポジトリの「Settings → Secrets → Actions」に追加：

```
VERCEL_TOKEN=xxx
VERCEL_ORG_ID=xxx
VERCEL_PROJECT_ID=xxx
ESTAT_APP_ID=xxx
RESAS_API_KEY=xxx
```

`VERCEL_ORG_ID` と `VERCEL_PROJECT_ID` は `.vercel/project.json` から確認できます。

---

## 自動デプロイ

`main` ブランチへの push で Vercel が自動的にビルド＆デプロイします（Vercel の標準機能）。

---

## 独自ドメインの追加（後から）

1. Vercel ダッシュボード「Settings → Domains」で追加
2. ドメインプロバイダーで CNAME / Aレコードを設定
3. `NEXT_PUBLIC_SITE_URL` 環境変数を新しいドメインに更新
4. Vercel が SSL 証明書を自動発行

---

## ビルド設定

`vercel.json` で設定済み：

- リージョン: `nrt1`（東京）
- セキュリティヘッダー: X-Content-Type-Options / X-Frame-Options / Referrer-Policy 等
- Sitemap キャッシュ: 24時間

---

## ローカル確認

```bash
pnpm build
pnpm start
# http://localhost:3000 で確認
```

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| OGP 画像が表示されない | `/public/og-image.png` を配置（1200×630px 推奨） |
| sitemap.xml が空 | `NEXT_PUBLIC_SITE_URL` が設定されているか確認 |
| データが古い | GitHub Actions「Update Data」を手動実行 |
