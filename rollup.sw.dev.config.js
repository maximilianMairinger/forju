import { merge } from "webpack-merge"
import commonMod from "./rollup.sw.common.config"


export default merge(commonMod, {
  watch: {
    include: 'serviceWorker/**',
    exclude: 'node_modules/**'
  }
})
