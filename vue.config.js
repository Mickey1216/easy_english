const CompressionWebpackPlugin = require("compression-webpack-plugin")
const productionGzipExtensions = ['js', 'css']

module.exports = {
    lintOnSave:false,
    devServer: {
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },

            "/youdao": {
                target: 'http://dict.youdao.com',
                changeOrigin: true,
                pathRewrite: {
                    '^/youdao': ''
                }
            }
        }
    },
    configureWebpack: {
        plugins: [
            // 配置compression-webpack-plugin压缩
            new CompressionWebpackPlugin({
                algorithm: 'gzip',
                test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
                threshold: 10240,
                minRatio: 0.8
            })
        ]
    }
}