# ニノヘミライ 実装台帳

二戸市の見える化サイト「ニノヘミライ」で採用する初期指標・団体・議員活動の定点観測実装を進めるための管理台帳。  
一次ソース: 二戸市公式、公表資料、議会資料、岩手県オープンデータ、e-Stat。

---

## 実装方針

- 指標はまず30項目前後に絞り、トップページではその一部のみを見せる。
- 取得元は「二戸市公式」「岩手県共同オープンデータ」「e-Stat」「議会資料」に限定し、取得経路を安定させる。
- **RESAS API は提供終了済みのため、依存先として採用しない。**
- 議員活動は議会だより、議会TOP、会議結果、会議録・映像導線を組み合わせて構造化する。

---

## 指標台帳

JSON実装: `data/manual/indicator_registry.json`（29指標）

| ID | 分類 | 指標名 | 初期表示 | 主取得元 | 取得方法 | 更新頻度の想定 | JSONキー例 | 状態 |
|---|---|---|---|---|---|---|---|---|
| P01 | 人口 | 総人口 | する | 岩手県オープンデータ（二戸市） | CSV確認・取得 | 月次想定 | `population_total` | planned |
| P02 | 人口 | 年少人口比率 | する | 岩手県オープンデータ（二戸市） | CSV集計 | 月次想定 | `population_young_ratio` | planned |
| P03 | 人口 | 生産年齢人口比率 | する | 岩手県オープンデータ（二戸市） | CSV集計 | 月次想定 | `population_working_age_ratio` | planned |
| P04 | 人口 | 高齢化率 | する | 岩手県オープンデータ（二戸市） | CSV集計 | 月次想定 | `population_aging_ratio` | planned |
| P05 | 人口 | 将来人口見通し | する | 人口ビジョン・総合戦略 | PDF/HTML抽出 | 計画改定時 | `population_projection` | manual |
| W01 | 働く力 | 事業所数 | する | e-Stat | API/CSV | 調査更新時 | `establishments_total` | planned |
| W02 | 働く力 | 産業別事業所数 | する | e-Stat | API/CSV | 調査更新時 | `establishments_by_industry` | planned |
| W03 | 働く力 | 就業構造 | する | e-Stat API | API | 調査更新時 | `employment_structure` | planned |
| W04 | 働く力 | 若者就業関連 | 検討 | e-Stat API | API | 調査更新時 | `youth_employment` | planned |
| E01 | 稼ぐ力 | 地域経済構造の主要値 | する | 人口ビジョン・総合戦略 | PDF/HTML抽出 | 計画改定時 | `economic_overview` | manual |
| E02 | 稼ぐ力 | 産業別従業者数 | する | e-Stat API | API | 調査更新時 | `employees_by_industry` | planned |
| E03 | 稼ぐ力 | 主要産業の動向 | する | 人口ビジョン・総合戦略 | PDF/HTML抽出 | 計画改定時 | `key_industries_trend` | manual |
| I01 | 受け継ぐ力 | 総合計画上の継承テーマ | する | 人口ビジョン・総合戦略 | PDF/HTML抽出 | 計画改定時 | `inheritance_policy_topics` | manual |
| I02 | 受け継ぐ力 | 総合計画推進委員会での関連論点 | する | 総合計画推進委員会 | HTML/PDF | 会議開催時 | `inheritance_committee_topics` | planned |
| C01 | つながる力 | 地域活動関連の主要論点 | する | 総合計画審議会議事録 | PDF抽出 | 会議開催時 | `community_topics` | manual |
| C02 | つながる力 | 公衆無線LAN拠点数 | する | 岩手県オープンデータ（二戸市） | CSV | 不定期 | `wifi_points` | planned |
| C03 | つながる力 | 公共施設数 | する | 岩手県オープンデータ（二戸市） | CSV | 不定期 | `public_facilities_count` | planned |
| R01 | 備える力 | AED設置箇所数 | する | 岩手県オープンデータ（二戸市） | CSV | 不定期 | `aed_locations_count` | planned |
| R02 | 備える力 | 介護サービス事業所数 | する | 岩手県オープンデータ（二戸市） | CSV | 不定期 | `care_service_locations_count` | planned |
| R03 | 備える力 | 財務4表 | する | 財務諸表公表 | PDF/Excel確認 | 年次 | `financial_statements` | manual |
| R04 | 備える力 | 決算概要 | する | 決算報告 | PDF/HTML抽出 | 年次 | `settlement_summary` | manual |
| R05 | 備える力 | 財務・会計ページ掲載資料 | する | 財務・会計 | HTMLリンク収集 | 年次/随時 | `finance_documents` | planned |
| L01 | 暮らせる力 | 子育て施設数 | する | 岩手県オープンデータ（二戸市） | CSV | 不定期 | `childcare_facilities_count` | planned |
| L02 | 暮らせる力 | 公衆トイレ数 | する | 岩手県オープンデータ（二戸市） | CSV | 不定期 | `public_toilets_count` | planned |
| L03 | 暮らせる力 | 医療・健康の参考値 | 検討 | e-Stat | CSV/API | 公開更新時 | `life_table_reference` | planned |
| G01 | 行財政 | 総合計画の重点施策 | する | 人口ビジョン・総合戦略 | PDF/HTML抽出 | 計画改定時 | `strategy_priority_measures` | manual |
| G02 | 行財政 | 総合計画推進委員会の開催結果 | する | 総合計画推進委員会 | HTML/PDF | 開催時 | `plan_committee_updates` | planned |
| A01 | 行政資源 | 市の公開データ件数 | する | 岩手県オープンデータ一覧 | HTML確認/CKAN API | 随時 | `open_data_dataset_count` | **active** |
| A02 | 行政資源 | 市の公表資料更新状況 | する | 二戸市公表 | HTML巡回 | 随時 | `public_documents_updates` | **active** |

---

## 団体台帳

JSON実装: `data/manual/organization_registry.json`（6団体）

| ID | 区分 | 団体名 | 主な役割 | 初期掲載 | actorId | 状態 |
|---|---|---|---|---|---|---|
| ORG01 | 行政 | 二戸市役所 | 行政全般 | する | actor-mayor | active |
| ORG02 | 議会 | 二戸市議会 | 議決・質問・審議 | する | actor-council-chair | active |
| ORG03 | 議会 | 総合計画推進委員会 | 計画審議 | する | — | planned |
| ORG04 | 経済 | 二戸市商工会 | 事業者支援 | する | — | planned |
| ORG05 | 医療福祉 | 介護サービス事業所群 | 高齢者支援 | する | — | planned |
| ORG06 | 子育て教育 | 子育て施設群 | 子育て支援 | する | — | planned |

---

## 議員活動台帳

JSON実装: `data/manual/council_activity_registry.json`（7名）

議員活動は「全発言ログの完全再現」ではなく、「方向性・関心テーマ・最近の動き」が伝わる構造で実装する。

| ID | 項目 | 内容 | 主取得元 | 取得方法 |
|---|---|---|---|---|
| MP01 | 議員名 | 氏名 | 二戸市議会TOP | HTML抽出 |
| MP02 | 所属/役職 | 会派・役職等 | 二戸市議会TOP | HTML抽出 |
| MP03 | 最近の質問テーマ | 一般質問概要 | 市議会だより | PDF抽出 |
| MP04 | 継続テーマ | 継続して扱う論点 | 議会だより複数号 | PDF横断集計 |
| MP05 | 活動種別 | 一般質問/委員会/議案 | 二戸市議会TOP | HTML/PDF |
| MP06 | 6つの力との紐付け | work〜live の関係 | 議会だより・手動分類 | 手動/半自動 |
| MP07 | 発言要旨 | 短い要約 | 議会だより | 要約 |
| MP08 | 元資料リンク | 原典導線 | 議会TOP | URL保持 |
| MP09 | 更新日 | 最終反映日 | サイト管理値 | 自動付与 |

---

## 取得優先順位

1. HTMLやCSVで安定公開されている二戸市公式・オープンデータを使う。
2. 時系列や統計の厚みが必要なものは e-Stat を使う。
3. 政策文脈や方向性は人口ビジョン、総合戦略、総合計画推進委員会資料を使う。
4. 議員活動は議会だより中心で始め、必要に応じて会議録や動画に広げる。
5. **RESAS API は使わない**（提供終了済み）。

---

## スクリプト構成

| スクリプト | 役割 | 実行タイミング |
|---|---|---|
| `scripts/fetch/fetch-ninohe-open-data.ts` | 岩手県OD カタログ取得（CKAN API） | 毎日 |
| `scripts/fetch/fetch-ninohe-public-pages.ts` | 二戸市公式ページ更新確認 | 毎日 |
| `scripts/fetch/fetch-ninohe-council.ts` | 議会審議情報 HTMLスクレイプ | 毎日 |
| `scripts/fetch/fetch-estat-core.ts` | e-Stat コア統計（ESTAT_APP_ID必要） | 週次 (full) |
| `scripts/transform/build-indicators.ts` | 台帳 + raw → indicators.json 補完 | 毎日 |
| `scripts/transform/build-organizations.ts` | 団体台帳 整合性チェック | 毎日 |
| `scripts/transform/build-council-activities.ts` | 議員活動台帳 → actors.json 反映 | 週次 (full) |
| `scripts/transform/normalize-council.ts` | 議会セッション → movements.json | 毎日 |
