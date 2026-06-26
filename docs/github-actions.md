# GitHub Actions ガイド

## ワークフロー一覧

| ファイル | トリガー | 目的 |
|----------|----------|------|
| `ci.yml` | push / PR to main | lint・型チェック・ビルド |
| `update-data.yml` | 毎日 11:00 JST / 毎週日曜 10:00 JST / 手動 | データ自動更新 |

---

## ci.yml — CI パイプライン

### 実行内容

1. `pnpm install --frozen-lockfile`
2. `pnpm lint` — ESLint
3. `pnpm type-check` — TypeScript `tsc --noEmit`
4. `pnpm validate` — Zod による processed データの整合性チェック
5. `pnpm build` — Next.js 静的ビルド

### 注意点

- ビルドは `NEXT_PUBLIC_SITE_URL=https://ninohe-mirai.example.com` をセットして実行（本番 URL でなくて構わない）
- `concurrency` 設定により同一ブランチの重複 job はキャンセルされる

---

## update-data.yml — データ自動更新

### スケジュール

```
0 2 * * *   # 毎日 2:00 UTC = 11:00 JST（軽量更新）
0 1 * * 0   # 毎週日曜 1:00 UTC = 10:00 JST（完全更新）
```

### 更新モード

| モード | 対象 | 所要時間 |
|--------|------|----------|
| `light` | e-Stat のみ | 〜1分 |
| `full` | e-Stat + RESAS | 〜3分 |

日曜は自動的に `full` モードで実行されます。

### 必要な GitHub Secrets

```
ESTAT_APP_ID   — e-Stat API ID（無料登録: https://api.e-stat.go.jp/）
RESAS_API_KEY  — RESAS API キー（無料登録: https://opendata.resas-portal.go.jp/）
```

`secrets.*` が設定されていない場合、スクリプトはスタブデータで動作し（差分なしで）終了します。

### 自動コミットの仕組み

```bash
git add data/processed/ data/raw/
git diff --staged --quiet || git commit -m "chore: auto-update data ..."
```

差分がなければコミットしません。`[skip ci]` タグで CI の再トリガーを防いでいます。

### 手動実行

1. GitHub リポジトリ「Actions」タブ
2. 「Update Data」ワークフローを選択
3. 「Run workflow」→ モード選択（light / full）→ 実行

---

## データ取得の優先順位

API が使えない場合は以下の順でフォールバックします：

1. **API**（e-Stat, RESAS） — 自動取得
2. **CSV / XLSX / GeoJSON** — `data/raw/` に手動配置 → transform スクリプトで変換
3. **定点 HTML / PDF** — `scripts/fetch/fetch-ninohe-sources.ts` のチェックリストで確認
4. **限定的スクレイピング** — 著作権・利用規約を確認の上、`scripts/fetch/` に追加

---

## スクリプト実行

```bash
# データ更新（全体）
pnpm update-data

# 個別実行
npx tsx scripts/fetch/fetch-estat.ts
npx tsx scripts/fetch/fetch-resas.ts
npx tsx scripts/transform/normalize-estat.ts
npx tsx scripts/transform/normalize-resas.ts

# 手動確認チェックリスト
npx tsx scripts/fetch/fetch-ninohe-sources.ts

# Zod バリデーション
pnpm validate
```
