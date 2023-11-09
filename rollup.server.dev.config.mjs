import { merge } from "webpack-merge"
import commonMod from "./rollup.server.common.config"


export default merge(commonMod, {
  watch: {
    include: 'server/src/**',
    exclude: 'node_modules/**'
  }
})