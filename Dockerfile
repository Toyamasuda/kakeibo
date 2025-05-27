# ビルドステージ
FROM node:20-alpine AS builder

WORKDIR /app

# 依存関係のインストールに必要なファイルをコピー
COPY package*.json ./
COPY tsconfig.json ./

# 依存関係のインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# アプリケーションのビルド
RUN npm run build

# 実行ステージ
FROM node:20-alpine AS runner

WORKDIR /app

# 本番環境変数の設定
ENV NODE_ENV=production
ENV PORT=8080

# 必要なファイルのみをビルドステージからコピー
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 本番依存関係のみをインストール
RUN npm ci --only=production

# アプリケーションの起動
CMD ["node", "server.js"] 