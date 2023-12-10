import { merge } from "webpack-merge"
import commonMod from "./rollup.server.common.config.mjs"
import terser from "@rollup/plugin-terser"


export default merge(commonMod, {
  plugins: [terser()]
})