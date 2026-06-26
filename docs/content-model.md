# コンテンツモデル

## 概念構造

```
Power（6つの力）
  ├── Indicator[]（指標）
  │     ├── TrendPoint[]（年次推移）
  │     └── Source（出典）
  └── Movement[]（動き）
        ├── Actor[]（担い手）
        └── Source?（出典）
```

## データ型

### Power（6つの力）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 一意ID |
| slug | PowerSlug | URLスラッグ（固定6値） |
| name | string | 表示名（例: 働く力） |
| description | string | 短い説明 |
| icon | string | Lucideアイコン名 |
| color | string | Tailwindカラー名 |
| summary | string | 現状サマリー |
| headline | string | 代表指標の文字列 |
| trend | "up" | "down" | "stable" | 全体的な傾向 |
| strengths | string[] | 活かされている資源 |
| challenges | string[] | 活かしきれていない課題 |
| indicatorIds | string[] | 関連指標のIDリスト |

### Indicator（指標）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 一意ID |
| powerId | string | 所属する力のID |
| name | string | 指標名 |
| value | number | 最新値 |
| unit | string | 単位 |
| year | number | 最新値の年 |
| trend | TrendPoint[] | 年次推移データ |
| sourceId | string | 出典ID |
| notes | string? | 補足説明 |

### Actor（担い手）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 一意ID |
| type | ActorType | 種別（official/council/community/npo） |
| name | string | 氏名・組織名 |
| role | string | 役職・役割 |
| affiliation | string | 所属 |
| focusPowers | string[] | 関係する力のslug |
| lastActive | string | 最終活動確認日（YYYY-MM形式） |
| summary | string | 活動概要 |

### Movement（動き）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 一意ID |
| date | string | 日付（YYYY-MM-DD） |
| title | string | タイトル |
| summary | string | 概要 |
| type | MovementType | 種別（policy/event/initiative/announcement） |
| actorIds | string[] | 関連担い手のID |
| powerSlugs | string[] | 関連する力のslug |
| sourceId | string? | 出典ID |

### Source（出典）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 一意ID |
| title | string | 資料名 |
| organization | string | 発行機関 |
| url | string? | URL |
| year | number | 発行年 |
| type | SourceType | 種別（official/academic/media/survey） |

### UpdateLog（更新ログ）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | 一意ID |
| date | string | 更新日（YYYY-MM-DD） |
| category | UpdateCategory | 種別（data/content/design/system） |
| summary | string | 更新内容 |
| author | string | 更新者 |

## 固定値

### PowerSlug
`"work" | "earn" | "inherit" | "connect" | "prepare" | "live"`

### ActorType
`"official"（行政） | "council"（議会） | "community"（地域団体） | "npo"（NPO）`

### MovementType
`"policy"（政策） | "event"（イベント） | "initiative"（取組） | "announcement"（発表）`

### SourceType
`"official"（公式） | "academic"（学術） | "media"（報道） | "survey"（調査）`

### UpdateCategory
`"data"（データ） | "content"（コンテンツ） | "design"（デザイン） | "system"（システム）`
