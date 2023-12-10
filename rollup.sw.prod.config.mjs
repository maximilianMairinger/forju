import { merge } from "webpack-merge"
import commonMod from "./rollup.sw.common.config.mjs"
import terser from "@rollup/plugin-terser"


export default merge(commonMod, {
  plugins: [terser()]
})
