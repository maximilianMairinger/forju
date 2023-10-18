import Component from "../component"
import declareComponent from "./../../lib/declareComponent"
import { loadRecord } from "../_themeAble/_frame/frame"
import { Data } from "josm"
import ResablePromise from "../../lib/resablePromise"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

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
  public readonly loaded: {[key in typeof resesList[number]]?: ResablePromise<void>} = {}
  private elems: {[key in typeof resesList[number]]?: {picture: HTMLPictureElement, sources: {setSource: (src: string) => void}[], img: HTMLImageElement &  {setSource: (src: string) => void}}} = {}
  private myWantedRes = this.resizeData().tunnel(({width, height}) => Math.sqrt(width * height * ratio))
  protected body: BodyTypes
  constructor(src?: string, forceLoad?: boolean) {
    //@ts-ignore
    super(false)


    this.myWantedRes.get(() => {
      const wantedResName = this.getCurrentlyWantedRes()
      if (wantedResName && this.loaded[wantedResName] === undefined) {
        this.loadSrc(this.src(), wantedResName)
      }
    }, false)

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

    this.newLoadedPromise(loadRes)
  }

  private newLoadedPromise(resolution: typeof resesList[number]) {
    this.loaded[resolution] = new ResablePromise((res, rej) => {
      this.elems[resolution].img.onload = () => {
        res();
      }
      this.elems[resolution].img.onerror = () => {
        (rej as any)(new Error("Image failed to load. Url: " + this.elems[resolution].img.src));
      }
    })
  }

  private wasAtStageIndex = {}
  private currentlyActiveElems: {picture: HTMLPictureElement, sources: {setSource: (src: string) => void}[], img: HTMLImageElement &  {setSource: (src: string) => void}}
  private loadSrc(src: string, res: typeof resesList[number]): Promise<void> {
    const loadStageAtCall = this.currentLoadStage 
    if (this.loaded[res] !== undefined) return this.loaded[res]
    this.makeNewResElems(res, this.currentLoadStage)
    const thisActiveElems = this.elems[res]
    const { img, sources } = thisActiveElems

    const wasLoaded = loadingCache[src] && loadingCache[src][loadStageAtCall] && loadingCache[src][loadStageAtCall][res]
    

    if (this.loaded[res].setteled) this.newLoadedPromise(res)

    

    if (!wasLoaded) {
      if (loadingCache[src] === undefined) loadingCache[src] = {} as any
      
      if (loadingCache[src][loadStageAtCall] === undefined) loadingCache[src][loadStageAtCall] = {} as any
      if (loadingCache[src][loadStageAtCall][res] === undefined) loadingCache[src][loadStageAtCall][res] = false

      const firstTimeAtStage = !this.wasAtStageIndex[this.currentLoadStage]
      
      this.loaded[res].then(() => {
        loadingCache[src][loadStageAtCall][res] = true
        
        
        const lastActiveElems = this.currentlyActiveElems
        if (firstTimeAtStage && loadStageAtCall <= 1) thisActiveElems.img.css({filter: "blur(8px)", scale: 1.03})
        if (loadStageAtCall === 1 && firstTimeAtStage) {
          
          thisActiveElems.img.anim({opacity: 1}, 150).then(() => {
            if (lastActiveElems) lastActiveElems.img.anim({opacity: 0}, 150)
            thisActiveElems.img.anim({filter: "blur(0px)"}, 800)
            thisActiveElems.img.anim({scale: 1}, 800)
          })
        }
        else {
          thisActiveElems.img.anim({opacity: 1}, 300).then(() => {
            
            if (lastActiveElems) {
              lastActiveElems.img.css({opacity: 0})
            }
          })
        }
        this.currentlyActiveElems = thisActiveElems
      })
    }
    else {
      thisActiveElems.img.css({opacity: 1})
    }


    if (isExplicitLocation(src)) {
      img.src = src
    }
    else {
      const pointIndex = src.lastIndexOf(".")
      if (pointIndex !== -1) src = src.slice(0, pointIndex)
      sources.Inner("setSource", ["/res/img/dist/" + src + unionSymbol + res + "."])
    }

    this.wasAtStageIndex[this.currentLoadStage] = true

    return this.loaded[res].onSettled
  }
    

  private currentLoadStage: number


  private _src: string
  src(): string
  src(src: string, forceLoad?: boolean): this
  src(src?: string, forceLoad: boolean = false): any {
    if (src === undefined) return this._src
    this._src = src
    const isExplicitSrc = isExplicitLocation(src)
    if (forceLoad) {
      const wantedResName = this.getCurrentlyWantedRes()
      if (wantedResName && this.loaded[wantedResName] === undefined) return this.loadSrc(this._src, wantedResName)
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
        this.loadSrc(src, biggestLoadedRes as any)

        if (this.currentLoadStage === 0 && !isExplicitSrc) {
          loadRecord.full.add(() => {
            if (this.currentLoadStage >= 1) return
            this.currentLoadStage = 1
            const wantedResName = this.getCurrentlyWantedRes()
            if (wantedResName && this.loaded[wantedResName] === undefined) return this.loadSrc(this._src, wantedResName)
          })
        }
        else {
          const wantedResName = this.getCurrentlyWantedRes()
          if (wantedResName && this.loaded[wantedResName] === undefined) this.loadSrc(this.src(), wantedResName)  
        }

      }

      else {
        if (isExplicitSrc) {
          loadRecord.full.add(() => {
            this.currentLoadStage = 1
            const wantedResName = ""
            return this.loadSrc(this._src, wantedResName as any)
          })
        }
        else {
          loadRecord.minimal.add(() => {
            if (this.currentLoadStage >= 0) return
            this.currentLoadStage = 0
            const wantedResName = this.getCurrentlyWantedRes()
            if (wantedResName) return this.loadSrc(this._src, wantedResName)
          })
  
          loadRecord.full.add(() => {
            if (this.currentLoadStage >= 1) return
            this.currentLoadStage = 1
            const wantedResName = this.getCurrentlyWantedRes()
            if (wantedResName) return this.loadSrc(this._src, wantedResName)
          })
        }
        
      }
      
      
    }
    return this
  }

  private getCurrentlyWantedRes() {

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