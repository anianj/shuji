const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

rules.push({
  test: /\.css$/,
  use: [
    { loader: "style-loader" },
    {
      loader: "css-loader",
      options: {
        modules: {
          localIdentName: '[path][name]__[local]--[hash:base64:5]',
        }
      }
    }
  ]
});

module.exports = {
  module: {
    rules
  },
  plugins: plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"]
  }
};
