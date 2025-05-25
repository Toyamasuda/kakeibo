const fs = require('fs');

// サービスアカウントのJSONファイルを読み込む
const serviceAccount = require('../path-to-your-service-account.json');

// 環境変数用の文字列を作成
const envContent = `FIREBASE_ADMIN_CREDENTIALS=${JSON.stringify(serviceAccount)}`;

// .env.localファイルに書き込む
fs.writeFileSync('.env.local', envContent);

console.log('.env.localファイルが作成されました。'); 