# 公開前チェックリスト

初回公開・大型アップデート前に必ず確認してください。

---

## ビルド・品質

- [ ] `pnpm build` が通る（エラー 0件）
- [ ] `pnpm lint` が通る（warning 0件が理想。error は必須 0件）
- [ ] `pnpm type-check` が通る
- [ ] `pnpm validate` が通る（Zodスキーマが全 processed JSON に対してパスする）

---

## データ・出典

- [ ] `data/processed/` の全 JSON ファイルを最新化済み
- [ ] 各数値を原典（e-Stat / 二戸市統計書等）と突合確認済み
- [ ] 推計値は `isEstimate: true` フラグが付いている
- [ ] `data/manual/scores.json` のカスコアに説明 (`basis`) が記載されている
- [ ] `docs/data-sources.md` の出典一覧が最新
- [ ] `methodology` ページの更新履歴が最新 (`data/processed/updates.json`)

---

## SEO / メタデータ

- [ ] `NEXT_PUBLIC_SITE_URL` が本番 URL に設定されている
- [ ] 各ページの `title` / `description` が適切
- [ ] OGP 画像 (`/public/og-image.png` 1200×630px) が配置済み
- [ ] `/sitemap.xml` が全ページを含んでいる（ビルド後確認）
- [ ] `/robots.txt` が正しい（ビルド後確認）
- [ ] favicon (`/app/icon.svg`) が表示される

---

## 表示確認

- [ ] モバイル 375px — トップページ最初の2スクリーンで主旨が伝わる
- [ ] モバイル 390px — 文字切れ・はみ出しなし
- [ ] タブレット 768px — 2カラム表示が崩れていない
- [ ] デスクトップ 1024px / 1280px — レイアウト正常
- [ ] 404 ページ (`/nothing`) が表示される
- [ ] 存在しない `/powers/xyz` で 404 にフォールバック

---

## 内容・表現

- [ ] 「監視サイト」と誤解されない表現になっている（担い手・動きページ）
- [ ] 「活かしきれていない課題」がネガティブすぎない表現になっている
- [ ] カスコアの算出根拠が methodology ページに書かれている
- [ ] 免責文が適切に表示されている
- [ ] About ページの運営情報が正確

---

## 環境変数・秘密情報

- [ ] `.env` や `.env.local` が `.gitignore` に含まれ、コミットされていない
- [ ] `data/raw/` に API レスポンスの機密データが含まれていない
- [ ] Vercel 環境変数に `NEXT_PUBLIC_SITE_URL` が設定済み

---

## デプロイ

- [ ] Vercel でビルドが通る（Preview デプロイで確認）
- [ ] Preview URL で全ページが表示される
- [ ] `sitemap.xml` が Preview URL でアクセス可能
- [ ] GitHub Actions `ci.yml` が main ブランチで通っている

---

## 公開後の確認

- [ ] 本番 URL でトップページが表示される
- [ ] Google Search Console にサイトを登録（sitemap を送信）
- [ ] OGP が Twitter Card Validator / Facebook デバッガーで正しく表示される
