# ニノヘミライ

**二戸の資源と未来を見える化する**、岩手県二戸市の公共データ可視化ダッシュボード。

> 運営: ニノヘミライ編集部 / 企画: 荻野光希

---

## このリポジトリについて

- **公開前提** のオープンソースリポジトリです
- APIキー・パスワード等の機密情報は含みません
- 政府統計・オープンデータを加工・可視化します
- 未確認データや内部メモはリポジトリに含めません

詳細は [docs/public-repo-policy.md](docs/public-repo-policy.md) を参照してください。

---

## 技術スタック

| 技術 | バージョン | 用途 |
|------|----------|------|
| Next.js | 16 (App Router) | フレームワーク / SSG |
| TypeScript | 5 | 型安全 |
| Tailwind CSS | v4 | スタイリング |
| Recharts | 3 | グラフ |
| Zod | 4 | データバリデーション |
| pnpm | 11 | パッケージマネージャ |

---

## ページ構成

| パス | 説明 |
|------|------|
| `/` | トップ（ヒーロー・6つの力・最近の動き） |
| `/powers` | 6つの力 一覧 |
| `/powers/[slug]` | 各力の詳細（指標・グラフ・動き） |
| `/movement` | 動き 一覧 |
| `/actors` | 担い手 一覧 |
| `/methodology` | 調査方法・出典 |
| `/about` | このサイトについて |

---

## 開発セットアップ

```bash
# 依存インストール
pnpm install

# 開発サーバー起動
pnpm dev
# → http://localhost:3000

# ビルド確認
pnpm build

# 型チェック
pnpm type-check

# データ検証
pnpm validate
```

---

## 環境変数

`.env.example` をコピーして `.env.local` を作成してください。

```bash
cp .env.example .env.local
```

| 変数 | 必須 | 説明 |
|------|------|------|
| `NEXT_PUBLIC_SITE_URL` | 本番のみ | 公開URL（OGP・sitemap用） |
| `ESTAT_APP_ID` | データ更新時 | e-Stat API ID |
| `RESAS_API_KEY` | データ更新時 | RESAS API キー |

ローカル開発時はダミー値でビルドが通ります。

---

## データ更新

```bash
# ローカルで実行
pnpm update-data

# GitHub Actions から手動実行
# → Actions タブ → "Update Data" → "Run workflow"
```

詳細は [docs/github-actions.md](docs/github-actions.md) を参照。

---

## デプロイ

Vercel へのデプロイを想定しています。

```bash
npx vercel
```

詳細は [docs/deployment.md](docs/deployment.md) を参照。

---

## データ実装台帳

指標・団体・議員活動の定点観測実装は [docs/implementation-ledger.md](docs/implementation-ledger.md) で管理しています。

| ファイル | 内容 |
|---|---|
| `data/manual/indicator_registry.json` | 指標台帳 (29指標) |
| `data/manual/organization_registry.json` | 団体台帳 (6団体) |
| `data/manual/council_activity_registry.json` | 議員活動台帳 (7名) |

---

## ドキュメント

| ファイル | 内容 |
|----------|------|
| [docs/implementation-ledger.md](docs/implementation-ledger.md) | 指標・団体・議員活動 実装台帳 |
| [docs/data-sources.md](docs/data-sources.md) | データソース一覧・引用元 |
| [docs/data-pipeline.md](docs/data-pipeline.md) | データ変換パイプライン |
| [docs/deployment.md](docs/deployment.md) | Vercel デプロイ手順 |
| [docs/github-actions.md](docs/github-actions.md) | CI/CD ワークフロー |
| [docs/public-repo-policy.md](docs/public-repo-policy.md) | 公開リポジトリポリシー |

---

## ディレクトリ構成

```
ninohe-mirai/
├── .github/workflows/       # CI/CD
│   ├── ci.yml               # ビルド・型チェック
│   └── update-data.yml      # データ自動更新
├── app/                     # Next.js App Router
│   ├── layout.tsx           # OGP・metadata
│   ├── sitemap.ts           # sitemap.xml
│   ├── robots.ts            # robots.txt
│   └── ...ページ
├── components/              # 共通コンポーネント
├── data/
│   ├── processed/           # Zod検証済みデータ（Git管理）
│   ├── manual/              # 編集部カスコア
│   └── raw/                 # API生データ（.gitignore推奨）
├── scripts/
│   ├── fetch/               # データ取得スクリプト
│   ├── transform/           # データ変換スクリプト
│   ├── sync/                # 更新オーケストレーター
│   └── validate/            # Zodバリデーション
├── docs/                    # 運用ドキュメント
├── lib/
│   ├── schemas.ts           # Zodスキーマ
│   ├── data.ts              # データローダー
│   └── utils.ts             # ヘルパー
├── .env.example             # 環境変数テンプレート
└── vercel.json              # Vercel設定
```

---

## 公開前チェック

初回公開前に以下のチェックリストを確認してください。

- [docs/release-checklist.md](docs/release-checklist.md) — ビルド・データ・SEO・表示の公開前確認
- [docs/manual-qa-checklist.md](docs/manual-qa-checklist.md) — 操作による手動 QA 確認

---

## ライセンス

- コード: MIT
- データ: 各データソースのライセンスに準拠（[docs/data-sources.md](docs/data-sources.md) 参照）
