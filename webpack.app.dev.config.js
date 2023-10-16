const { merge } = require("webpack-merge")
const commonMod = require("./webpack.app.common.config")

module.exports = (env) => {
  const common = commonMod(env);
  return merge(common, {
    watch: true,
    devtool: 'inline-source-map',
    mode: "development"
  })
};
