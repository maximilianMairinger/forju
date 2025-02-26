import express from "express"
import bodyParser from "body-parser"
import xrray from "xrray"; xrray(Array);
import * as MongoDB from "mongodb";
const MongoClient = MongoDB.MongoClient
import pth from "path"
import fs from "fs"
import detectPort from "detect-port"
import ws, { WebSocketServer, WebSocket } from "ws"
import keyIndex from "key-index"
import { ResablePromise } from "more-proms"

const defaultPortStart = 3050

export type App = express.Express & { 
  port: number, 
  getWebSocketServer: (url: `/${string}`) => WebSocketServer,
  ws: (url: `/${string}`, cb: (ws: WebSocket & {on: WebSocket["addEventListener"], off: WebSocket["removeEventListener"]}, req: any) => void) => void,
}


export type SendFileProxyFunc = (file: string, ext: string, fileName: string) => string | void | null

export function configureExpressApp(indexUrl: string, publicPath: string, cb: (app: App) => void, sendFileProxy?: Promise<SendFileProxyFunc> | SendFileProxyFunc, callAtStart?: (app: express.Express) => express.Express | void) {
  if (indexUrl !== "*") if (!indexUrl.startsWith("/")) indexUrl = "/" + indexUrl

  let app = express() as express.Express & { 
    port: number, 
    getWebSocketServer: (url: `/${string}`) => WebSocketServer,
    ws: (url: `/${string}`, cb: (ws: WebSocket & {on: WebSocket["addEventListener"], off: WebSocket["removeEventListener"]}, req: any) => void) => void,
  }
  
  
  

  if (callAtStart) {
    let q = callAtStart(app)
    if (q !== undefined && q !== null) app = q as any
  }
  app.use(bodyParser.urlencoded({extended: false}))
  app.use(bodyParser.json())


  let sendFileProxyLoaded: Function = (res: any) => (path: string) => {
    res.old_sendFile(pth.join(pth.resolve(""), path))
  }
  if (sendFileProxy) {
    (async () => {
      let proxy = await sendFileProxy
      sendFileProxyLoaded = (res: any) => (path: string) => {
        let file = fs.readFileSync(path).toString()
        let extName = pth.extname(path)
        let end = proxy(file, pth.extname(path), pth.basename(path, extName))
        if (end === undefined) res.send(file)
        else if (end === null) res.status(400).end()
        else res.send(end)
      }
    })()
  }

  app.use(express.static(pth.join(pth.resolve(""), publicPath), {index: false}))



  //@ts-ignore
  app.old_get = app.get
  //@ts-ignore
  app.get = (url: string, cb: (req: any, res: any, next) => void) => {
    //@ts-ignore
    app.old_get(url, (req, res, next) => {
      res.old_sendFile = res.sendFile
      res.sendFile = sendFileProxyLoaded(res)
      cb(req, res, next)
    })
  }

  let prt = process.env.port
  let _port: Promise<number>
  if (prt === undefined) {
    _port = (detectPort(defaultPortStart) as Promise<number>)
    _port.then((port) => {console.log("No port given, using fallback - Serving on http://127.0.0.1:" + port)}) as Promise<number>
  }
  else _port = Promise.resolve(+prt);
  

  
  const webSocketServerMap = keyIndex((url: `/${string}`) => new ws.Server({ noServer: true, path: url }))
  app.getWebSocketServer = webSocketServerMap;
  

  (async () => {
    app.port = await _port
    const port = app.port
  
    
    const expressServer = app.listen(port)
    app.ws = (url: `/${string}`, cb: (ws: WebSocket & {on: WebSocket["addEventListener"], off: WebSocket["removeEventListener"]}, req: any) => void) => {
      const websocketServer = webSocketServerMap(url)
      websocketServer.on("connection", (ws, req) => {
        cb(ws, req)
      })
    }
  
    expressServer.on("upgrade", (request, socket, head) => {
      const url = request.url as `/${string}`
      webSocketServerMap(url).handleUpgrade(request, socket, head, (websocket) => {
        webSocketServerMap(url).emit("connection", websocket, request);
      });
    });
  
  })().then(async () => {
    await cb(app)

    // everything after user land code

    app.get(indexUrl, (req, res) => {
      res.sendFile("public/index.html")
    });
  })
}

type DBConfig = {
  url: string,
  dbName: string
}


const publicPath = "./public"

export default function (dbName_DBConfig: string | DBConfig, indexUrl?: string): Promise<{ db: MongoDB.Db, app: App }>
export default function (dbName_DBConfig?: undefined | null, indexUrl?: string): Promise<App>;
export default function (dbName_DBConfig?: string | null | undefined | DBConfig, indexUrl: string = "*"): any {
  const userlandExecDoneProm = new ResablePromise()
  const app = new ResablePromise() as any
  configureExpressApp(indexUrl, publicPath, async (_app) => {
    app.res(_app)
    await userlandExecDoneProm
  })

  if (dbName_DBConfig) {
    let dbConfig: DBConfig
    if (typeof dbName_DBConfig === "string") dbConfig = { dbName: dbName_DBConfig, url: "mongodb://127.0.0.1:27017"}
    else dbConfig = dbName_DBConfig

    const prom = new Promise((res) => {
      MongoClient.connect(dbConfig.url, { useUnifiedTopology: true }).then(async (client) => {
        let db = client.db(dbConfig.dbName)
        res({db, app: await app})
      }).catch(async (e) => {
        console.error("Unable to connect to MongoDB")
        console.error(e)

        res({app: await app})
      })
    })

    const ogThen = prom.then.bind(prom)
    prom.then = (f) => {
      return f !== null && f !== undefined ? ogThen((r) => {
        userlandExecDoneProm.res()
        const res = f(r);
        (async () => {
          await res
          userlandExecDoneProm.res()
        })
        return res
      }) : f
    }
    return prom
  }
  else return app
}

