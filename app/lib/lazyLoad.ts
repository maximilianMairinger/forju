import { MultiMap } from "more-maps"
import keyIndex from "key-index"

const loadStates = ["minimalContentPaint", "fullContentPaint", "completePaint"] as ["minimalContentPaint", "fullContentPaint", "completePaint"]
const defaultPreloadToLoadStatus = loadStates[1]

export const loadedSymbol = Symbol("loaded")

function initStageProm() {
  let r: Function
  const p = new Promise((res) => {r = res}) as any
  p.started = false
  p.res = () => {
    p.yet = true
    r()
  }
  return p as Promise<void> & {started: boolean, yet: boolean, res: () => void}
}


export default function init<Func extends () => Promise<any>>(resources: ImportanceMap<any, any>, globalInitFunc?: (instance: any, index: number) => void | Promise<void>) {
  const resolvements = new Map<Import<any, any>, (load: () => Promise<{default: {new(): any}}>, index: number, domainFrag: string, state: (typeof loadStates)[number]) => void>();
  const resourcesMap = new ResourcesMap();

  resources.forEach((e: () => Promise<object>, imp) => {

    if (imp.val !== undefined) {
      let instanc: any
      let resProm: any
      let prom = new Promise((res) => {
        resolvements.set(imp, async (load: () => Promise<{default: {new(): any}}>, index: number, domainFrag: string, state?) => {
          const stageIndex = keyIndex((subStateUid: any) => {
            const ob = {}
            for (const stage of loadStates) ob[stage] = initStageProm()
            return ob as {[stage in typeof loadStates[number]]: ReturnType<typeof initStageProm>}
          })

          const loadState = async (load: () => Promise<{default: {new(): any}}>, index: number, domainFrag: string, state?) => {
            const instance = await instanceProm
            
            if (state) {
              const loadUid = instance.domainFragmentToLoadUid !== undefined ? instance.domainFragmentToLoadUid === true ? domainFrag : instance.domainFragmentToLoadUid(domainFrag) : undefined
              const stage = stageIndex(loadUid)[state]
              if (!stage.started) {
                stage.started = true
                await instance[state](loadUid)
                stage.res()
              }
            }
            
          }

          let instanceProm = ((async () => imp.initer((await load()).default)))();


          


          resolvements.set(imp, loadState)

          
          const instance = await instanceProm

          const stageOb = instance[loadedSymbol] = {}
          for (const stage of loadStates) {
            stageOb[stage] = initStageProm()
          }

          if (dontRes) {
            instanc = instance
            resProm = res
          }
          
          
          if (globalInitFunc !== undefined) await globalInitFunc(instance, index);

          await loadState(load, index, domainFrag, state)
          
          if (!dontRes) res(instance)          
        })
      })

      let dontRes = false

      //@ts-ignore
      prom.imp = imp

      //@ts-ignore
      prom.priorityThen = async function(fromDomain: string, cb?: Function, deepLoad?: boolean) {
        dontRes = true
        await resources.superWhiteList(fromDomain, imp, deepLoad)
        let result: any
        if (cb) result = await cb(instanc)
        if (resProm) resProm(instanc)
        return result !== undefined ? result : instanc
      }
      //@ts-ignore
      resourcesMap.add(imp.val, prom);
    }
  });

  //@ts-ignore
  resourcesMap.reloadStatusPromises();


  (resources as any).resolve(<Mod>(load: () => Promise<{default: {new(): Mod}}>, imp: Import<string, Mod>, index: number, domainFrag: string, state?: any) => {
    return resolvements.get(imp)(load, index, domainFrag, state)
  })
  


  return {
    resourcesMap,
    importanceMap: resources
  }
}

import slugify from "slugify"
import { dirString } from "./domain";
export const slugifyUrl = (url: string) => url.split(dirString).replace((s) => slugify(s)).join(dirString)


export type PriorityPromise<T = any> = Promise<T> & {imp: Import<string, any>, priorityThen: (fromDomain: string, cb?: (instance: any) => void, deepLoad_loadToStage?: boolean | typeof loadStates[number]) => any}

export class BidirectionalMap<K, V> extends Map<K, V> {
  public reverse: Map<V, K> = new Map

  set(k: K, v: V) {
    this.reverse.set(v, k)
    return super.set(k, v)
  }
  delete(k: K) {
    this.reverse.delete(this.get(k))
    return super.delete(k)
  }
}


export class ResourcesMap extends MultiMap<string, PriorityPromise> {
  public fullyLoaded: Promise<any>
  public anyLoaded: Promise<any>
  public loadedIndex: BidirectionalMap<string, any>
  constructor(...index: {key: string, val: PriorityPromise}[]) {
    let toBeAdded = []
    for (let e of index) {
      toBeAdded.add({key: slugifyUrl(e.key), val: e.val})
    }
    super(...toBeAdded)
    this.loadedIndex = new BidirectionalMap
  } 

  public getLoadedKeyOfResource(resource: any) {
    return this.loadedIndex.reverse.get(resource)
  }
  public getLoaded(resource: any) {
    return this.loadedIndex.get(resource)
  }

  private reloadStatusPromises() {
    let proms = []
    this.forEach((key, es) => {
      for (const e of es) {
        proms.add(e)
      }
    })
    
    this.fullyLoaded = Promise.all(proms)
    this.anyLoaded = Promise.race(proms)
  }
  public add(key: string, val: PriorityPromise) {
    return super.add(slugifyUrl(key), val)
  }
}



export class ImportanceMap<Func extends () => Promise<{default: {new(): Module}}>, Module> extends Map<Import<string, Module>, Func> {
  private importanceList: Import<string, Module>[] = [];

  constructor(...index: {key: Import<string, Module>, val: Func}[]) {
    super()
    for (let e of index) {
      this.importanceList.add(e.key)
      super.set(e.key, e.val)
    }
  }

  private resolver: (e: Func, key: Import<string, Module>, index: number, domainFrag: string, state?: (typeof loadStates)[number]) => any
  protected resolve(resolver: ImportanceMap<Func, Module>["resolver"]) {
    this.resolver = resolver
    if (this.superWhiteListCache) {
      this.superWhiteList(this.superWhiteListCache.domainFrag, this.superWhiteListCache.imp, this.superWhiteListCache.deepLoad)
    }
    if (!this.whiteListedImports.empty) {
      this.startResolvement()
    }
  }

  private async startResolvement(toStage: typeof loadStates[number] = defaultPreloadToLoadStatus) {
    if (!this.resolver) return
    const toStageIndex = loadStates.indexOf(toStage) + 1
    const whiteList = this.whiteListedImports
    whiteList.sort((a, b) => b.imp.importance - a.imp.importance)
    for (let j = 0; j < toStageIndex; j++) {
      const state = loadStates[j];
      for (let i = 0; i < whiteList.length; i++) {
        if (whiteList !== this.whiteListedImports) return
        while (this.superWhiteListDone) await this.superWhiteListDone
        const mine = this.whiteListedImports[i]
        await this.resolver(this.get(mine.imp), mine.imp, this.importanceList.indexOf(mine.imp), mine.domainFrag, state);
      }
    }
  }

  public getByString(key: string): {key: Import<string, Module>, val: Func} {
    let kk: any, vv: any;
    this.forEach((v,k) => {
      if (k.val === key) {
        vv = v;
        kk = k;
      }
    });
    if (!kk || !vv) throw new Error("No such value found")
    return {key: kk, val: vv};
  }
  public set(key: Import<string, Module>, val: Func): this {
    this.importanceList.add(key);
    super.set(key, val);
    return this;
  }

  public whiteList(imp: {domainFrag: string, imp: Import<string, Module>}[], toStage?: typeof loadStates[number]) {
    this.whiteListedImports = imp
    return this.startResolvement(toStage)
  }
  public whiteListAll(toStage?: typeof loadStates[number]) {
    return this.whiteList(this.importanceList.map((imp) => ({imp, domainFrag: null})), toStage)
  }

  private superWhiteListCache: {domainFrag: string, imp: Import<string, Module>, deepLoad: boolean | typeof loadStates[number]}
  public superWhiteList(domainFrag: string, imp: Import<string, Module>, deepLoad?: false): Promise<any>
  public superWhiteList(domainFrag: string, imp: Import<string, Module>, deepLoad: true): Promise<any>
  public superWhiteList(domainFrag: string, imp: Import<string, Module>, loadToStage: typeof loadStates[number]): Promise<any>
  public superWhiteList(domainFrag: string, imp: Import<string, Module>, loadToStage_deepLoad: boolean | typeof loadStates[number]): Promise<any>
  public superWhiteList(domainFrag: string, imp: Import<string, Module>, loadToStage_deepLoad: boolean | typeof loadStates[number] = loadStates.first) {
    this.superWhiteListCache = {imp, deepLoad: loadToStage_deepLoad, domainFrag}
    if (!this.resolver) return
    
    let mySuperWhiteListDone = this.superWhiteListDone = new Promise(async (res) => {
      const v = this.get(imp)
      if (loadToStage_deepLoad) {
        let ind = 0
        for (const { imp: i } of this.whiteListedImports) {
          if (i === imp) {
            this.whiteListedImports.rmI(ind)
            break
          }
          ind++
        }


        const toStage = loadToStage_deepLoad === true ? loadStates.last : loadToStage_deepLoad
        const toStageIndex = loadStates.indexOf(toStage) + 1
        for (let i = 0; i < toStageIndex; i++) {
          const state = loadStates[i]

          await this.resolver(v, imp, this.importanceList.indexOf(imp), domainFrag, state)
          if (mySuperWhiteListDone !== this.superWhiteListDone) {
            if (state !== loadStates.last) this.whiteListedImports.add({imp, domainFrag})
            res()
            return
          }
        }
      }
      else {
        await this.resolver(v, imp, this.importanceList.indexOf(imp), domainFrag)
      }
      
      this.superWhiteListDone = undefined
      res()
    })
    
    
    return mySuperWhiteListDone
  }

  public whiteListedImports = [] as {domainFrag: string, imp: Import<string, Module>}[]
  private superWhiteListDone: Promise<void>
}

export class Import<T, Mod> {
  constructor(public val: T, public importance: number, public initer: (mod: {new(): Mod}) => Mod) {

  }
}