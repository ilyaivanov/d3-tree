const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";
  return {
    devtool: isProd ? undefined : "inline-source-map",
    entry: "./src/vanilla/main.ts",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "app.[chunkhash].js",
    },
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: {
            loader: "ts-loader",
            options: {
              onlyCompileBundledFiles: true,
            },
          },
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "index.html",
      }),
      isProd ? new CleanWebpackPlugin() : undefined,
    ].filter((x) => x),
  };
};
