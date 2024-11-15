// webpack.config.js
const path = require('path');

module.exports = {
    entry: './server.js', // Adjust the entry point as needed
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'), // Adjust the output directory as needed
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader', // Ensure you have babel-loader installed if using Babel
                },
            },
        ],
    },
    resolve: {
        fallback: {
            "url": require.resolve("url/"),
            "path": require.resolve("path-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            "zlib": require.resolve("browserify-zlib"),
            "querystring": require.resolve("querystring-es3"),
            "buffer": require.resolve("buffer/"),
            "stream": require.resolve("stream-browserify"),
            "util": require.resolve("util/"),
            "os": require.resolve("os-browserify/browser"),
            "http": require.resolve("stream-http"),
            "fs": false,
            "net": false,
            "vm": require.resolve("vm-browserify"),
            "assert": require.resolve("assert/")
        }
    },
};