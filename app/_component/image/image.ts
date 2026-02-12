import Component from "../component"
import declareComponent from "./../../lib/declareComponent"
import { getCurrentLoadRecord } from "../_themeAble/_frame/frame"
import { ResablePromise, ResableSyncPromise } from "more-proms"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import keyIndex from "key-index";
import { Data } from "josm";
import { capitalize } from "../../lib/util";

const unionSymbol = "@"
const typePrefix = "image/"


const formats = [
  "avif",
  "webp",
  "jpg"
]

const maxRes = "4K"
const fullRes = "2K"
const prevRes = "PREV"

const resesList = [ 
  prevRes,
  fullRes,
  maxRes
] as const


// TODO not dependent on border of image but instead dependent on the image resolution within the borderes (img can be cut off but will still need big res) 
const resStages = [
  {
    0: prevRes
  },
  {
    20: fullRes,
    1600: maxRes
  }
]


const loadingCache = {} as { [src: string]: {[loadStage: number]: {[resName: string]: boolean | undefined}} }






const whenPossibleFormats = formats.slice(0, -1)
const fallbackFormat = formats.last


function isExplicitLocation(location: string) {
  const firstSlash = location.indexOf("/")
  if (firstSlash === 0) return true
  if (location[firstSlash + 1] === "/") return true
  return false
}


const ratio = 16 / 9

export default class Image extends Component {
  public readonly loadedRes: {[key in typeof resesList[number]]?: ResablePromise<void>} = {}
  public readonly loaded = {
    full: new ResablePromise<void>(),
    min: new ResablePromise<void>()
  }
  private loadRecord = getCurrentLoadRecord()
  private minLoadedSyncProm = new ResableSyncPromise()
  private elems: {[key in typeof resesList[number]]?: {picture: HTMLPictureElement, sources: {setSource: (src: string) => void}[], img: HTMLImageElement &  {setSource: (src: string) => void}}} = {}
  private myWantedRes = new Data(0)
  protected body: BodyTypes
  constructor(src?: string, forceLoad?: boolean) {
    //@ts-ignore
    super(false)

    this.resizeDataBase()(({width, height}) => this.myWantedRes.set(Math.sqrt(width * height * ratio)))


    this.myWantedRes.get(() => {
      const wantedResName = this.getCurrentlyWantedRes()
      if (wantedResName && this.loadedRes[wantedResName] === undefined) {
        this.loadSrc(this.src(), wantedResName)
      }
    }, false)


    const firstSideToBeSizeRestricted = new Data<"width" | "height" | "both" | "none">("none")
    const sub = this.resizeDataBase()(({width, height}) => {
      const w = width !== 0
      const h = height !== 0
      firstSideToBeSizeRestricted.set(w && h ? "both" : w ? "width" : h ? "height" : "none")
    })
    firstSideToBeSizeRestricted.get((val) => {
      if (val !== "none") sub.deactivate()
    })
    let lastCls: `sizeRestricted${"none" | "width" | "height" | "both"}`
    firstSideToBeSizeRestricted.get((side) => {
      // if (this.src() === "https://ghost.maximilian.mairinger.com/content/images/2024/05/daniel-sessler-HYD91Hk8Wjo-unsplash.jpg") debugger
      if (lastCls !== undefined) this.removeClass(lastCls)
      this.addClass(lastCls = `sizeRestricted${capitalize(side)}` as any)
    })
    


    // this.elems[resesList.first].img.setAttribute("importance", "high")

    
    if (src) this.src(src, forceLoad)
  }

  private makeNewResElems(loadRes: typeof resesList[number], loadStage: number) {
    if (loadRes === undefined) return
    const sources = []
    const img = ce("img") as HTMLImageElement & {setSource: (to: string) => string}
    //@ts-ignore
    img.crossorigin = "anonymous"
    img.setSource = (to) => img.src = to + fallbackFormat
    
    const picture = ce("picture")

    this.elems[loadRes] = {sources, img, picture}
    

    for (let format of whenPossibleFormats) {
      const source = ce("source") as HTMLSourceElement & {setSource: (to: string) => string}
      source.type = typePrefix + format
      source.setSource = (to: string) => source.srcset = to + format
      sources.add(source)
    }

    sources.add(img as any)

    
    picture.setAttribute("res", loadRes)
    picture.setAttribute("loadStage", loadStage.toString())
    picture.apd(...sources)
    this.apd(picture)

    this.loadedPromiseAndHookMemo(loadRes)
  }

  private loadedPromiseMemo = keyIndex((resolution: typeof resesList[number]) => {
    const prom = this.loadedRes[resolution] = new ResablePromise<void>((res, rej) => {}) as ResablePromise<void>
    prom.then(() => {
      if (resolution === "PREV") this.loaded.min.res()
      else {
        this.loaded.min.res()
        this.loaded.full.res()
      }
    })
    return prom
  })

  private loadedPromiseAndHookMemo = keyIndex((resolution: typeof resesList[number]) => {
    const prom = this.loadedPromiseMemo(resolution)
    this.elems[resolution].img.onload = () => {
      this.minLoadedSyncProm.res()
      prom.res();
    }
    this.elems[resolution].img.onerror = () => {
      (prom.rej as any)(new Error("Image failed to load. Url: " + this.elems[resolution].img.src));
    }
    return prom
  })

  // with fallback
  private async loadSrc(src: string, res: typeof resesList[number]) {
    const errorBackgroundStyle = {
      backgroundColor: '#ffe6e6',
  backgroundImage: `url("data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'>\
  <rect width='40' height='40' fill='%23ffe6e6'/>\
  <path d='M0,40 L40,0 M-10,10 L10,-10 M30,50 L50,30' \
        stroke='%23ff4d4f' stroke-width='10'/>\
</svg>")`,
  backgroundRepeat: 'repeat',
  backgroundSize: '40px 40px',
      opacity: 1
    };
    try {
      return await this.reallyLoadSrc(src, res)
    }
    catch(e) {
      console.error("Image failed to load. Url: " + src, e);
      this.elems[res].img.css(errorBackgroundStyle)
    }
  }


  private wasAtStageIndex = {}
  private currentlyActiveElems: {picture: HTMLPictureElement, sources: {setSource: (src: string) => void}[], img: HTMLImageElement &  {setSource: (src: string) => void}}
  private reallyLoadSrc(src: string, res: typeof resesList[number]): Promise<void> {
    const loadStageAtCall = this.currentLoadStage 
    if (this.elems[res] !== undefined) return this.loadedRes[res]
    this.makeNewResElems(res, this.currentLoadStage)
    const thisActiveElems = this.elems[res]
    const { img, sources } = thisActiveElems

    const wasLoaded = loadingCache[src] && loadingCache[src][loadStageAtCall] && loadingCache[src][loadStageAtCall][res]


    // I dont think this is important, as we make a new one in makeNewResElems anyway
    // if (this.loaded[res].settled) this.newLoadedPromise(res)

    
    const firstTimeAtStage = !this.wasAtStageIndex[this.currentLoadStage]
    const lastActiveElems = this.currentlyActiveElems

    const loadingAnim = () => {
      if (loadStageAtCall === 1 && firstTimeAtStage) {
          
        thisActiveElems.img.anim({opacity: 1}, 150).then(() => {
          // console.log(this)
          if (lastActiveElems) lastActiveElems.img.anim({opacity: 0}, 150)
          thisActiveElems.img.anim({filter: "blur(0px)"}, 800)
          thisActiveElems.img.anim({scale: 1}, 800)
        })
      }
      else {
        thisActiveElems.img.anim({opacity: 1}, 300).then(() => {
          // console.log(this)
          if (lastActiveElems) {
            lastActiveElems.img.css({opacity: 0})
          }
        })
      }
    }


    const proms = [] as Promise<void>[]
    if (!wasLoaded) {
      if (loadingCache[src] === undefined) loadingCache[src] = {} as any
      if (loadingCache[src][loadStageAtCall] === undefined) loadingCache[src][loadStageAtCall] = {} as any
      if (loadingCache[src][loadStageAtCall][res] === undefined) loadingCache[src][loadStageAtCall][res] = false

      
      
      proms.push(this.loadedRes[res].then(() => {
        loadingCache[src][loadStageAtCall][res] = true
        
        if (firstTimeAtStage && loadStageAtCall <= 1) thisActiveElems.img.css({filter: "blur(8px)", scale: 1.03})
        loadingAnim()
      }))
    }
    else {
      loadingAnim()
      // thisActiveElems.img.css({opacity: 1})
    }

    this.currentlyActiveElems = thisActiveElems


    if (isExplicitLocation(src)) {
      img.src = src
    }
    else {
      sources.Inner("setSource", [this.baseUrl + src + unionSymbol + res + "."])
    }

    this.wasAtStageIndex[this.currentLoadStage] = true

    return (Promise.all([this.loadedRes[res].onSettled, ...proms]) as any as Promise<void>).then(() => {
      // do this before we resolve load promise here, so that functions depending on myWantedRes (specifically getCurrentlyWantedRes) have valid state even if called immediately after this promise, without a delay for the on resize function to trigger
      const width = this.offsetWidth
      const height = this.offsetHeight
      this.myWantedRes.set(Math.sqrt(width * height * ratio))
    })
  }
    

  private currentLoadStage: number

  private baseUrl = "/res/img/dist/"
  private _src: string
  src(): string
  src(src: string, forceLoad?: boolean): this
  src(src?: string, forceLoad: boolean = false): any {
    if (src === undefined) return this._src

    let isExplicitSrc = isExplicitLocation(src)

    if (isExplicitSrc) {
      const srcUrl = new URL(src)
      if (srcUrl.host === "ghost.maximilian.mairinger.com") {
        const ghostImgDir = "/content/images/"
        if (srcUrl.pathname.startsWith(ghostImgDir)) {
          srcUrl.pathname = srcUrl.pathname.splice(ghostImgDir.length, 0, "dist/")
          const fullSrc = srcUrl.toString()
          const picNameStartIndex = fullSrc.lastIndexOf("/")
          const picNameWithExt = fullSrc.slice(picNameStartIndex + 1)
          const picNamePointIndex = picNameWithExt.lastIndexOf(".")
          const picName = picNameWithExt.slice(0, picNamePointIndex)
          const srcWOPic = fullSrc.slice(0, picNameStartIndex + 1)
          src = picName
          this.baseUrl = srcWOPic
          isExplicitSrc = false
        }
      }
    }
    else {
      const pointIndex = src.lastIndexOf(".")
      if (pointIndex !== -1) src = src.slice(0, pointIndex)
    }


    if (src === "WhatsApp-Image-2026-01-15-at-5.43.50-PM-1") debugger
    this._src = src
    
    if (forceLoad) {
      if (isExplicitSrc) {
        const wantedResName = ""
        this.loadedPromiseMemo(wantedResName as any)
        this.currentLoadStage = 1
        return this.loadSrc(this._src, wantedResName as any)
      }
      else {
        this.currentLoadStage = 0
        const wantedResName = this.getCurrentlyWantedRes()
        if (wantedResName && this.loadedRes[wantedResName] === undefined) return this.loadSrc(this._src, wantedResName).then(() => {
          this.currentLoadStage = 1
          const wantedResName = this.getCurrentlyWantedRes()
          return this.loadSrc(this._src, wantedResName)
        })
      }
      
    }
    else {
      if (loadingCache[src]) {
        this.currentLoadStage = +Object.keys(loadingCache[src]).last
        let biggestLoadedRes: any
        for (const key in loadingCache[src][this.currentLoadStage]) {
          if (loadingCache[src][this.currentLoadStage][key] === true) {
            biggestLoadedRes = key
          }
        }

        if (biggestLoadedRes === undefined) {
          this.currentLoadStage = undefined
          this.deferLoading()
        }
        else {
          this.loadSrc(src, isExplicitSrc ? "" : biggestLoadedRes as any)

          if (this.currentLoadStage === 0 && !isExplicitSrc) {
            this.loadRecord.full.add(() => {
              if (this.currentLoadStage >= 1) return
              this.currentLoadStage = 1
              const wantedResName = this.getCurrentlyWantedRes()
              if (wantedResName && this.loadedRes[wantedResName] === undefined) return this.loadSrc(this._src, wantedResName)
            })
          }
          else {
            const wantedResName = this.getCurrentlyWantedRes()
            if (wantedResName && this.loadedRes[wantedResName] === undefined) this.loadSrc(this.src(), wantedResName)  
          }
        }
      }

      else {
        if (isExplicitSrc) {
          const wantedResName = ""
          this.loadedPromiseMemo(wantedResName as any)
          this.loadRecord.full.add(() => {
            this.currentLoadStage = 1
            return this.loadSrc(this._src, wantedResName as any)
          })
        }
        else {
          this.deferLoading()
        }
        
      }

      
    }


    
    return this
  }

  private deferLoading() {
    this.loadRecord.minimal.add(() => {
      if (this.currentLoadStage >= 0) return
      this.currentLoadStage = 0
      const wantedResName = this.getCurrentlyWantedRes()
      if (wantedResName) return this.loadSrc(this._src, wantedResName)
    })

    this.loadRecord.full.add(() => {
      if (this.currentLoadStage >= 1) return
      this.currentLoadStage = 1
      const wantedResName = this.getCurrentlyWantedRes()
      if (wantedResName) return this.loadSrc(this._src, wantedResName)
    })
  }

  private getCurrentlyWantedRes() {
    if (this._src !== undefined) {
      const isExplicitSrc = isExplicitLocation(this._src)
      if (isExplicitSrc) return ""
    }

    const stage = this.currentLoadStage
    const wantedRes = this.myWantedRes.get()
    const resStage = resStages[stage]


    let res: any
    for (const minRes in resStage) {
      if (+minRes <= wantedRes) {
        res = resStage[minRes]
      }
    }
    return res
  }



  stl() {
    return super.stl() + require("./image.css").toString()
  }

  pug() {
    return require("./image.pug").default
  }

}

declareComponent("image", Image)