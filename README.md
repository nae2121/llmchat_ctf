# LLM Prompt Injection CTF

LLM に対するプロンプトインジェクションを題材にした CTF 問題です。

Web チャット画面から Gemini にメッセージを送り、システムプロンプトに埋め込まれた機密情報を漏えいさせないように設計された AI アシスタントと対話します。参加者は入力文を工夫し、AI の拒否ルールを回避して隠されたフラグの取得を目指します。

## 概要

- Flask 製のシンプルなチャットアプリです。
- `/` でチャット UI を表示します。
- `/chat` に JSON でメッセージを送ると Gemini API に問い合わせます。
- LLM のシステム指示には、フラグとそれを漏らさないための拒否ルールが含まれています。
- フロントエンドでは入力を 200 文字に制限しています。

## ディレクトリ構成

```text
.
├── app.py                 # Flask アプリ本体
├── chatai.py              # Gemini API 呼び出しとシステムプロンプト
├── requirements.txt       # Python 依存関係
├── Dockerfile             # Gunicorn で起動する本番向けコンテナ
├── Docker-compose.yml     # Flask + Nginx 構成
├── nginx.conf             # Nginx リバースプロキシ設定
├── vercel.json            # Vercel デプロイ設定
├── templates/
│   └── index.html         # チャット画面
└── static/
    ├── css/style.css      # UI スタイル
    ├── js/main.js         # チャット送受信処理
    └── img/               # アバター画像
```

## 必要要件

- Python 3.10 以上
- Gemini API キー
- Docker / Docker Compose（Docker で起動する場合）

## セットアップ

`.env` を作成し、Gemini API キーを設定してください。

```env
API_KEY=your_gemini_api_key
```

Python で直接起動する場合は、依存関係をインストールします。

```bash
pip install -r requirements.txt
python app.py
```

起動後、ブラウザで以下にアクセスします。

```text
http://localhost:5000
```

## Docker での起動

このリポジトリには `Docker-compose.yml` が含まれています。

```bash
docker compose --env-file .env -f Docker-compose.yml up --build
```

古い Docker Compose を使う場合は、以下のように実行します。

```bash
docker-compose --env-file .env -f Docker-compose.yml up --build
```

起動後、ブラウザで以下にアクセスします。

```text
http://localhost
```

## API

### `GET /`

チャット画面を表示します。

### `POST /chat`

ユーザーのメッセージを受け取り、LLM の応答を返します。

リクエスト例:

```json
{
  "message": "こんにちは"
}
```

レスポンス例:

```json
{
  "response": "こんにちは！どのようなお手伝いをしましょうか？"
}
```

## CTF 運用メモ

- フラグは `chatai.py` のシステムプロンプト内に配置されています。
- 公開環境で使用する場合は、サンプル値を実際のフラグに置き換えてください。
- API キーや本番用フラグを Git にコミットしないでください。
- この問題は LLM のプロンプトインジェクション学習用です。実サービスの防御実装としてそのまま利用することは想定していません。
- フロントエンドの 200 文字制限は UI 側の制限です。必要に応じてサーバー側でも入力長やレート制限を実装してください。

## デプロイ

### Docker + Nginx

`Docker-compose.yml` では Flask アプリを Gunicorn で `web:8000` に起動し、Nginx が `80` 番ポートでリバースプロキシします。

### Vercel

`vercel.json` には Python アプリとして `app.py` を動かす設定と、`static` 配下のファイルを配信するルーティングが含まれています。Vercel で利用する場合は、環境変数 `API_KEY` をプロジェクト設定に登録してください。

## 注意事項

このリポジトリは CTF・教育目的のサンプルです。LLM の出力はモデルや設定により変化する可能性があります。問題の難易度を調整する場合は、`chatai.py` のシステムプロンプト、モデル名、入力制限、サーバー側の検証ロジックを調整してください。
