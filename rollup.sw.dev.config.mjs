import { merge } from "webpack-merge"
import commonMod from "./rollup.sw.common.config.mjs"


export default merge(commonMod, {
  watch: {
    include: 'serviceWorker/**',
    exclude: 'node_modules/**'
  }
})
