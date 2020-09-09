const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { Server } = require('./Src/Config');

module.exports = {
    devtool: 'eval-source-map',
    entry: ['babel-polyfill', Server.entryDirectory],
    output: {
        path: path.join(__dirname, Server.outputDirectory),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: [
                    'babel-loader',
                ],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    devServer: {
        open: true,
        https: false,
        host: "localhost",
        port: 3000,
        proxy: {
            '/api': 'http://localhost:8080'
        }
    },
    plugins: [
        new CleanWebpackPlugin({ cleanAfterEveryBuildPatterns: ['outputDirectory'] }),
        new HtmlWebpackPlugin({
            template: './Build/index.html'
        })
    ]
};