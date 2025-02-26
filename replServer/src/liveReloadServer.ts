import expressWs from "express-ws"
import chokidar from "chokidar"
import pth from "path"
import fs from "fs"
import xtring from "xtring"; xtring();

import { App, configureExpressApp, SendFileProxyFunc } from "./../../server/src/setup"
import { ResablePromise } from "more-proms";



function formatPath (path: string) {
  let localPath = path.substring(7)
  localPath = localPath.split("\\").join("/")
  if (pth.extname(localPath) === "") localPath += "/"
  return localPath
}





const publicPath = "./public"


export default async function init(indexUrl: string = "*", _wsUrl: string = "/reloadWs") {
  let wsUrl: `/${string}`
  if (!_wsUrl.startsWith("/")) wsUrl = ("/" + _wsUrl) as `/${string}`
  else wsUrl = _wsUrl as `/${string}`


  const appProm = new ResablePromise() as any
  configureExpressApp(indexUrl, publicPath, (app) => {
    appProm.res(app)
  }, (file, ext) => {
    if (ext === ".html" || ext === ".htm") {
      let injectAt = file.lastIndexOf("</body>")
      return file.splice(injectAt, 0, swInjTxt())
    }
  })

  const app = await appProm as any as App

  const clients = app.getWebSocketServer(wsUrl).clients as Set<WebSocket>

  // app.ws(wsUrl, () => {})

  
  
  chokidar.watch(publicPath, { ignoreInitial: true }).on("all", (event, path) => {
    path = formatPath(path)

    console.log("Change at: \"" + path + "\"; Restarting app.")

    clients.forEach((c) => {
      c.send(JSON.stringify({reeee: "reload please"}))
    })
  })


  

  // inject
  const swInjTxt = () => `
<!-- Code Injected by the live server -->
<script>
(() => {
let wsUrl = "${wsUrl}";
${fs.readFileSync(pth.join(__dirname, "./../res/live-reload-inject.js")).toString()}
})()
</script>`


  
  return app
}
