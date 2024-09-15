const nodemon = require("nodemon")
const detectPort = require("detect-port")
const args = require("yargs").argv;
const path = require("path")
const fs = require("fs")
const open = require("open")
const waitOn = require("wait-on")
const del = require("del")
const chokidar = require("chokidar")
const mkdirp = require("mkdirp")
const {default: delay} = require("tiny-delay")
let imageWeb
try {
  imageWeb = require("image-web")
}
catch(e) {
  console.log("Unable to load image-web, skipping image compression. This is probably due to the fact that sharp not able to properly install.")
}

// configureable
const serverEntryFileName = "server.js"
const appEntryFileName = "forju.js"






let serverDir = "./server/dist";
let appDir = "./public/dist";

if (args.dev === "repl") {
  serverDir = "./replServer/dist"
}
else if (args.dev === "server") {
  serverDir = "./server/dist";
}


let serverEntryPath = path.join(serverDir, serverEntryFileName)
let appEntryPath = path.join(appDir, appEntryFileName);




(async (wantedPort = 6500) => {


  await Promise.all([
    del(appDir).then(() => console.log("Deleted \"" + appDir + "\".")),
    del(serverDir).then(() => console.log("Deleted \"" + serverDir + "\"."))
  ])

  console.log("")
  console.log("")
  console.log("Waiting for build to finish, before starting the server...")


  await waitOn({
    resources: [serverEntryPath, appEntryPath]
  })


  let gotPort;
  try {
    gotPort = await detectPort(wantedPort)
  }
  catch(e) {
    console.error(e)
    return
  }
  
  if (imageWeb) {
    const compressImages = imageWeb.constrImageWeb(["jpg", "webp", "avif"], ["4K", "2K", "PREV"])
    const imgDistPath = "public/res/img/dist" 
    const imgSrcPath = "app/res/img"
    mkdirp.sync(imgSrcPath)
    const imgChangeF = async (path, override) => {
      console.log("Compressing images")
      await delay(1000)
      await compressImages(path, imgDistPath, { override, silent: false })
    }
    
  
    
    imgChangeF(imgSrcPath, false)
    chokidar.watch(imgSrcPath, { ignoreInitial: true }).on("change", (path) => imgChangeF(path, true))
    chokidar.watch(imgSrcPath, { ignoreInitial: true }).on("add", (path) => imgChangeF(path, false))
  }
  





  let server = nodemon({
    watch: serverDir,
    script: serverEntryPath,
    env: {
      port: gotPort
    }
  })

  server.on("restart", (e) => {
    console.log("")
    console.log("-----------------")
    console.log("Server restarting")
    console.log("-----------------")
    console.log("")
  })

  
  
  
  
  console.log("")
  console.log("")

  if (gotPort !== wantedPort) console.log(`Port ${wantedPort} was occupied, falling back to: http://127.0.0.1:${gotPort}.\n----------------------------------------------\n`)
  else console.log(`Serving on http://127.0.0.1:${gotPort}.\n---------------------\n`)

  
  
  console.log("Starting Browser")
  //open(`http://127.0.0.1:${gotPort}`)
  
  
  
  
})(args.port)






