/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: {
        // ビルド時のESLintチェックを無効化
        ignoreDuringBuilds: true,
    },
    typescript: {
        // ビルド時の型チェックを無効化
        ignoreBuildErrors: true,
    },
    /* config options here */
};

module.exports = nextConfig; 