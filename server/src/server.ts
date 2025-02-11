import setup from "./setup"
import sani from "sanitize-against"

const saniQr = sani({
  qrName: String
})

console.log("process.env.inProd", process.env.inProd)
const qrCollectionName = process.env.inProd === "true" ? "qr" : "qrDev"

setup("forju").then(async ({app, db}) => {
  (function rqHandling() {
    const redirectMap = new Map()
    redirectMap.set("workshop1", "/projects/schulworkshops/")
    redirectMap.set("workshop2", "/projects/schulworkshops/")
    redirectMap.set("workshop", "/projects/schulworkshops/")
    redirectMap.set("fwdWXBC", "https://www.bildungschancen.wien/angebote/?tx_solr%5Bq%5D=For+Ju") // wien extra bildungschance
    app.get("/qr/:qrName", (req, res, next) => {
      try {
        const { qrName } = saniQr(req.params)
        console.log(qrName)
        if (db !== undefined) db.collection(qrCollectionName).updateOne({ qrName }, { $inc: { count: 1 } }, { upsert: true })
        else console.log(`QRVIEW: ${qrName}`)
        const redirect = redirectMap.get(qrName)
        if (redirect !== undefined) res.redirect(redirect)
        else res.redirect("/")
      }
      catch(e) {
        res.status(400)
      }
    })
  })()

})

