# データパイプライン

ニノヘミライのデータ処理フローの説明です。

## 概要

```
外部ソース
    │
    ▼
data/raw/           ← scripts/fetch/ が書き込む（生データ）
    │
    ▼
data/processed/     ← scripts/transform/ が書き込む（正規化済み）
    │
    ├── + data/manual/  ← 編集部が直接管理（スコア等）
    │
    ▼
data/derived/       ← scripts/sync/ が書き込む（派生データ）
    │
    ▼
lib/data.ts         ← Next.js がビルド時に読み込む
```

## ディレクトリ

### data/raw/

外部ソースからそのまま取得した生データ。変換なし。

```
data/raw/
  estat/
    2024-06-01/
      population.json
  resas/
    2024-04-15/
      industry.json
  ninohe-city/
    2024-07-01/
      statistics.pdf
```

### data/processed/

Zodスキーマに合わせた正規化済みデータ。アプリが直接読む。

```
data/processed/
  powers.json       ← PowerSchema[]
  indicators.json   ← IndicatorSchema[]
  movements.json    ← MovementSchema[]
  actors.json       ← ActorSchema[]
  sources.json      ← DataSourceSchema[]
  updates.json      ← UpdateLogSchema[]
```

### data/manual/

編集部が直接管理するデータ。自動生成しない。

```
data/manual/
  scores.json       ← カスコア（PowerScore[]）
```

### data/derived/

処理済みデータから生成される派生データ（ビルド最適化用）。

```
data/derived/
  radar.json              ← レーダーチャート用データ
  powers-with-scores.json ← スコア統合済みpower一覧
```

## スクリプト

### 1. フェッチ（scripts/fetch/）

```bash
pnpm tsx scripts/fetch/fetch-estat-population.ts
```

- 外部APIをコールし `data/raw/` に保存
- 日付スタンプ付きディレクトリに保存（再現性のため）
- 環境変数 `ESTAT_API_KEY` が必要

### 2. 変換（scripts/transform/）

```bash
pnpm tsx scripts/transform/transform-indicators.ts
```

- `data/raw/` を読み込み `data/processed/` に書き込む
- フィールド名・単位・日付形式を正規化
- Zodで型チェックしてから書き込む

### 3. 検証（scripts/validate/）

```bash
pnpm tsx scripts/validate/check-processed.ts
```

- `data/processed/` の全ファイルをZodで検証
- 相互参照チェック（IDの整合性）
- CI/CDで自動実行

### 4. 同期（scripts/sync/）

```bash
pnpm tsx scripts/sync/build-derived-data.ts
```

- `data/processed/` + `data/manual/` → `data/derived/`
- レーダーチャートデータなどの派生データを生成

## 更新サイクル

| データ種別 | 更新頻度 | 担当スクリプト |
|-----------|---------|---------------|
| 人口・世帯 | 年1回（4月頃） | fetch-estat-population |
| 産業・経済 | 年1回（3月頃） | fetch-resas-industry |
| 移住定住 | 随時 | 手動更新 |
| 議会・動き | 月1〜4回 | 手動更新 |
| スコア | 年2回 | data/manual/scores.json を直接編集 |

## 開発時のデータ更新手順

1. `data/processed/*.json` を直接編集（小規模な変更）
2. `pnpm tsx scripts/validate/check-processed.ts` で検証
3. `pnpm tsx scripts/sync/build-derived-data.ts` で派生データ更新
4. `pnpm build` でビルド確認
