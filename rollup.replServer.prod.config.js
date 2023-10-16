import { merge } from "webpack-merge"
import commonMod from "./rollup.replServer.common.config"
import { terser } from "rollup-plugin-terser"


export default merge(commonMod, {
  plugins: [terser()]
})
