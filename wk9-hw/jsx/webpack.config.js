let webpack = require('webpack');

// 一个nodejs模块
module.exports = {
    entry: "./animation-demo.js",
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: [["@babel/plugin-transform-react-jsx", {pragma: "createElement"}]]
                    }
                }
            }
        ]
    },
    mode: "development"
}