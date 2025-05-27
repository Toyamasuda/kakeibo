# ビルドステージ
FROM node:20-alpine AS builder

WORKDIR /app

# 必要なパッケージをインストール
RUN apk add --no-cache libc6-compat

# 依存関係のインストール
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# アプリケーションのビルド
RUN npm run build

# 実行ステージ
FROM node:20-alpine AS runner

WORKDIR /app

# 本番環境変数の設定
ENV NODE_ENV=production
ENV PORT=3000

# 必要なファイルのみをビルドステージからコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# アプリケーションの起動
EXPOSE 3000
CMD ["node", "server.js"] 