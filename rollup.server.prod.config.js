import { merge } from "webpack-merge"
import commonMod from "./rollup.server.common.config"
import { terser } from "rollup-plugin-terser"


export default merge(commonMod, {
  plugins: [terser()]
})