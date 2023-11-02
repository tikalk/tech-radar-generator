"use strict";

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const postcssPresetEnv = require("postcss-preset-env");

const r = (f) => path.resolve(__dirname, f);

let main = [r("src/site.js")];
let common = [r("./src/common.js")];

let plugins = [
  new MiniCssExtractPlugin({ filename: "[name].[fullhash].css" }),
  new HtmlWebpackPlugin({
    template: r("./src/index.html"),
    chunks: ["main"],
    inject: "body",
  }),
  new HtmlWebpackPlugin({
    template: r("./src/error.html"),
    chunks: ["common"],
    inject: "body",
    filename: "error.html",
  }),
];

module.exports = {
  context: process.cwd(),
  mode: "production",
  entry: {
    main: main,
    common: common,
  },
  output: {
    filename: "[name].[fullhash].js",
    clean: true,
    path: path.resolve(__dirname, "./dist"),
  },
  performance: {
    hints: false,
  },

  module: {
    rules: [
      {
        test: /\.(?:js)$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve("babel-loader"),
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve("css-loader"),
            options: { importLoaders: 1 },
          },
          {
            loader: require.resolve("sass-loader"),
            options: {
              sassOptions: {
                outputStyle: "compressed",
              },
            },
          },
          {
            loader: require.resolve("postcss-loader"),
            options: {
              postcssOptions: {
                plugins: [postcssPresetEnv({ browsers: "last 2 versions" })],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|ico|jpe?g|gif)$/i,
        use: [
          {
            loader: require.resolve("file-loader"),
            options: {
              name: "images/[name].[ext]",
              context: r("./src/images"),
            },
          },
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: require.resolve("file-loader"), // TODO- move to asset loader
            options: {
              name: "images/[name].[ext]",
            },
          },
        ],
      },
      {
        test: require.resolve("jquery"),
        loader: "expose-loader",
        options: {
          exposes: ["$", "jQuery"],
        },
      },
      {
        test: r("./src/data"),
        loader: require.resolve("val-loader"),
        options: {
          data: require("./example-data.json"),
        },
      },
    ],
  },

  plugins: plugins,

  devServer: {
    host: "0.0.0.0",
    port: 9001,
  },
};
