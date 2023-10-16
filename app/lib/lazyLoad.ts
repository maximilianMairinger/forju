const loadStates = ["minimalContentPaint", "fullContentPaint", "completePaint"] as ["minimalContentPaint", "fullContentPaint", "completePaint"]
const defaultPreloadToLoadStatus = loadStates[1]

import keyIndex from "key-index"

export const loadedSymbol = Symbol("loaded")

export default function init<Func extends () => Promise<any>>(resources: ImportanceMap<any, any>, globalInitFunc?: (instance: any, index: number) => void | Promise<void>) {
  const resolvements = new Map<Import<any, any>, (load: () => Promise<{default: {new(): any}}>, index: number, state: (typeof loadStates)[number]) => void>();
  const resourcesMap = new ResourcesMap();

  resources.forEach((e: () => Promise<object>, imp) => {

    if (imp.val !== undefined) {
      let instanc: any
      let resProm: any
      let prom = new Promise((res) => {
        resolvements.set(imp, async (load: () => Promise<{default: {new(): any}}>, index: number, state?) => {
          const loadState = async (load: () => Promise<{default: {new(): any}}>, index: number, state?) => {
            await instanceProm
            if (state) {
              const stage = instance[loadedSymbol][state]
              if (!stage.started) {
                stage.started = true
                await instance[state]()
                stage.res()
              }
            }
            
          }

          let instanceProm = ((async () => imp.initer((await load()).default)))();


          function initStageProm() {
            let r: Function
            const p = new Promise((res) => {r = res}) as any
            p.started = false
            p.res = () => {
              p.yet = true
              r()
            }
            return p
          }



          resolvements.set(imp, loadState)

          
          let instance = await instanceProm

          const stageOb = instance[loadedSymbol] = {}
          for (const stage of loadStates) {
            stageOb[stage] = initStageProm()
          }

          if (dontRes) {
            instanc = instance
            resProm = res
          }
          
          
          if (globalInitFunc !== undefined) await globalInitFunc(instance, index);

          await loadState(load, index, state)
          
          if (!dontRes) res(instance)          
        })
      })

      let dontRes = false

      //@ts-ignore
      prom.imp = imp

      //@ts-ignore
      prom.priorityThen = async function(cb?: Function, deepLoad?: boolean) {
        dontRes = true
        await resources.superWhiteList(imp, deepLoad)
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


  (resources as any).resolve(<Mod>(load: () => Promise<{default: {new(): Mod}}>, imp: Import<string, Mod>, index: number, state?: any) => {
    return resolvements.get(imp)(load, index, state)
  })
  


  return {
    resourcesMap,
    importanceMap: resources
  }
}

import slugify from "slugify"
import { dirString } from "./domain";
export const slugifyUrl = (url: string) => url.split(dirString).replace((s) => slugify(s)).join(dirString)


export type PriorityPromise<T = any> = Promise<T> & {imp: Import<string, any>, priorityThen: (cb?: (instance: any) => void, deepLoad_loadToStage?: boolean | typeof loadStates[number]) => any}

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

class MultiKeyMap<K, V> {
  private index = keyIndex<K, V[]>(() => [])
  constructor(...index: {key: K, val: V}[]) {
    for (const e of index) {
      this.index(e.key).add(e.val)
    }
  }
  add(key: K, val: V) {
    this.index(key).add(val)
  }
  getAll(key: K) {
    return this.index(key)
  }
  get(key: K, atIndex: number = 0) {
    return this.getAll(key)[atIndex]
  }
  
  has(key: K) {
    return !!this.getAll(key)
  }
  forEach(cb: (key: K, vals: V[]) => void) {
    for (let e of this.index.entries()) {
      // @ts-ignore
      cb(...e)
    }
  }
  *[Symbol.iterator](): IterableIterator<[key: K, vals: V[]]> {
    return this.index.entries()
  }
  entries() {
    return this[Symbol.iterator]()
  }
}

export class ResourcesMap extends MultiKeyMap<string, PriorityPromise> {
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



export class ImportanceMap<Func extends () => Promise<{default: {new(): Mod}}>, Mod> extends Map<Import<string, Mod>, Func> {
  private importanceList: Import<string, Mod>[] = [];

  constructor(...index: {key: Import<string, Mod>, val: Func}[]) {
    super()
    for (let e of index) {
      this.importanceList.add(e.key)
      super.set(e.key, e.val)
    }
  }

  private resolver: (e: Func, key: Import<string, Mod>, index: number, state?: (typeof loadStates)[number]) => any
  protected resolve(resolver: ImportanceMap<Func, Mod>["resolver"]) {
    this.resolver = resolver
    if (this.superWhiteListCache) {
      this.superWhiteList(this.superWhiteListCache.imp, this.superWhiteListCache.deepLoad)
    }
    if (!this.whiteListedImports.empty) {
      this.startResolvement()
    }
  }

  private async startResolvement(toStage: typeof loadStates[number] = defaultPreloadToLoadStatus) {
    if (!this.resolver) return
    const toStageIndex = loadStates.indexOf(toStage) + 1
    const whiteList = this.whiteListedImports
    whiteList.sort((a, b) => b.importance - a.importance)
    for (let j = 0; j < toStageIndex; j++) {
      const state = loadStates[j];
      for (let i = 0; i < whiteList.length; i++) {
        if (whiteList !== this.whiteListedImports) return
        while (this.superWhiteListDone) await this.superWhiteListDone
        await this.resolver(this.get(this.whiteListedImports[i]), this.whiteListedImports[i], this.importanceList.indexOf(this.whiteListedImports[i]), state);
      }
    }
  }

  public getByString(key: string): {key: Import<string, Mod>, val: Func} {
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
  public set(key: Import<string, Mod>, val: Func): this {
    this.importanceList.add(key);
    super.set(key, val);
    return this;
  }

  public whiteList(imp: Import<string, Mod>[], toStage?: typeof loadStates[number]) {
    this.whiteListedImports = imp
    return this.startResolvement(toStage)
  }
  public whiteListAll(toStage?: typeof loadStates[number]) {
    return this.whiteList(this.importanceList, toStage)
  }

  private superWhiteListCache: {imp: Import<string, Mod>, deepLoad: boolean | typeof loadStates[number]}
  public superWhiteList(imp: Import<string, Mod>, deepLoad?: false): Promise<any>
  public superWhiteList(imp: Import<string, Mod>, deepLoad: true): Promise<any>
  public superWhiteList(imp: Import<string, Mod>, loadToStage: typeof loadStates[number]): Promise<any>
  public superWhiteList(imp: Import<string, Mod>, loadToStage_deepLoad: boolean | typeof loadStates[number]): Promise<any>
  public superWhiteList(imp: Import<string, Mod>, loadToStage_deepLoad: boolean | typeof loadStates[number] = loadStates.first) {
    this.superWhiteListCache = {imp, deepLoad: loadToStage_deepLoad}
    if (!this.resolver) return
    
    let mySuperWhiteListDone = this.superWhiteListDone = new Promise(async (res) => {
      const v = this.get(imp)
      if (loadToStage_deepLoad) {
        if (this.whiteListedImports.includes(imp)) this.whiteListedImports.rmV(imp)


        const toStage = loadToStage_deepLoad === true ? loadStates.last : loadToStage_deepLoad
        const toStageIndex = loadStates.indexOf(toStage) + 1
        for (let i = 0; i < toStageIndex; i++) {
          const state = loadStates[i]

          await this.resolver(v, imp, this.importanceList.indexOf(imp), state)
          if (mySuperWhiteListDone !== this.superWhiteListDone) {
            if (state !== loadStates.last) this.whiteListedImports.add(imp)
            res()
            return
          }
        }
      }
      else {
        await this.resolver(v, imp, this.importanceList.indexOf(imp))
      }
      
      this.superWhiteListDone = undefined
      res()
    })
    
    
    return mySuperWhiteListDone
  }

  public whiteListedImports = []
  private superWhiteListDone: Promise<void>
}

export class Import<T, Mod> {
  constructor(public val: T, public importance: number, public initer: (mod: {new(): Mod}) => Mod) {

  }
}