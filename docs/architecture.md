# アーキテクチャ設計

## 基本方針

- **Static-first:** データはビルド時にJSON読み込み → `generateStaticParams` でSSG
- **Server Components優先:** データ取得・表示は基本的にServer Component
- **Client Componentは最小限:** インタラクティブな要素（ヘッダーメニュー・グラフ）のみ

## データフロー

```
data/processed/*.json
  └── lib/data.ts (Zodパース + ユーティリティ関数)
       └── app/**/page.tsx (Server Component)
            └── components/*.tsx (表示)
```

## コンポーネント設計

### Server Components（デフォルト）
- `PageContainer` — ページラッパー
- `HeroSection` — トップヒーロー
- `PowerCard` — 各力のカード
- `StatCard` — 指標カード
- `ActorCard` — 担い手カード
- `MovementCard` — 動きカード
- `SourceList` — 出典リスト
- `SectionHeading` — セクション見出し
- `UpdateBadge` — 更新バッジ
- `PowerBadge` — 力バッジ

### Client Components（`"use client"`）
- `SiteHeader` — ナビゲーション（モバイルメニューのstate管理）
- `MiniTrendChart` — Recharts（ブラウザAPIが必要）

## スタイル

Tailwind CSS v4 のみ使用。カスタムCSS最小限。

カラーシステム（各力に対応）:
- work: blue
- earn: emerald  
- inherit: amber
- connect: violet
- prepare: rose
- live: teal

`lib/utils.ts` の `POWER_COLOR_MAP` でTailwindクラス名を管理。

## 型システム

`lib/schemas.ts` にZodスキーマを集約。
`z.infer<>` で型を派生させ、JSONとコンポーネント間の型安全性を確保。

## 将来の拡張ポイント

- **外部データ取得:** `lib/data.ts` の関数を非同期化し、APIコールに置き換え可能
- **フィルター機能:** `/powers` `/movement` ページにクライアントサイドフィルターを追加
- **全文検索:** 動き・担い手の検索機能
- **地図表示:** 担い手や動きの地図連動
