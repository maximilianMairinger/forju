import ThemeAble, { Theme } from "../themeAble";
import { FutureRecord, StackedFutureRecord } from "../../../lib/record";
import { Data } from "josm";
import keyIndex from "key-index";
import { ResablePromise, ResableSyncPromise } from "more-proms";
import { isPromiseLike } from "../../../lib/util";
import LinkedList from "fast-linked-list";


const loadRecord = {
  minimal: new StackedFutureRecord(),
  content: new StackedFutureRecord(),
  full: new StackedFutureRecord()
}

const loadId = Symbol("loadId")

// IMPORTAMT: Call in the constructor of a component. When you then, want to add something to a loadRecord later, thats okay just save it at constructor invocation time to this. Otherwise you add it to the loadRecord of a different frame (that is currently loading), which may resolve at a random time or never. There is no warning about this!
export function getCurrentLoadRecord() {

  if (!override.empty) return override.last 


  for (const key in loadRecord) {
    if (loadRecord[key].currentRecord === undefined) throw new Error(`Load Error`)
  }

  if (!(loadRecord.minimal.currentRecord[loadId] === loadRecord.content.currentRecord[loadId] && loadRecord.content.currentRecord[loadId] === loadRecord.full.currentRecord[loadId])) {
    throw new Error("Load Error")
  }

  return {
    minimal: loadRecord.minimal.currentRecord,
    content: loadRecord.content.currentRecord,
    full: loadRecord.full.currentRecord
  }
}

const override = new LinkedList<{minimal: FutureRecord<unknown>, content: FutureRecord<unknown>, full: FutureRecord<unknown>}>()
// only call this if you know what you are doing.
export function overrideCurrentLoadRecord(newRec: {minimal: FutureRecord<unknown>, content: FutureRecord<unknown>, full: FutureRecord<unknown>}) {
  const tok = override.push(newRec)
  return tok.rm.bind(tok)
}

type ID = unknown
type Recording = ReturnType<typeof loadRecord.minimal.record>

function nameOb(name: string | PromiseLike<string>) {
  return function type(type: "minimal" | "content" | "full") {
    const composeName = (name: string) => `${type}_${name}`
    const ob = {} as { name: string | PromiseLike<string> }
    ob.name = isPromiseLike(name) ? name.then(n => composeName(n)) : composeName(name)
    return ob
  }
}

function makeRec(name: string | PromiseLike<string>) {
  const fn = nameOb(name)
  return {
    minimal: loadRecord.minimal.record(fn("minimal")),
    content: loadRecord.content.record(fn("content")),
    full: loadRecord.full.record(fn("full"))
  }
}


export default abstract class Frame extends ThemeAble<HTMLElement> {
  public readonly accentTheme: Data<"primary" | "secondary">


  public readonly active: boolean;
  public readonly initiallyActivated: boolean

  private records = new Map<unknown, {
    minimal: Recording,
    content: Recording,
    full: Recording
  }>()

  
  private nameP: PromiseLike<string>
  constructor(theme: Theme) {
    const nameP = new ResableSyncPromise<string>()
    const initRec = makeRec(nameP)
    super(undefined, theme)
    this.nameP = nameP
    nameP.res(this.tagName)
    this.accentTheme = new Data("primary") as Data<"primary" | "secondary">

    this.records.set(undefined, initRec)


    

    this.active = false
    this.initiallyActivated = false
    this.userInitedScrollEvent = true
  }
  public activate() {
    return this.vate(true)
  }
  public deactivate() {
    return this.vate(false)
  }
  
  public vate(activate: false)
  public vate(activate: true)
  public vate(activate: boolean) {
    (this as any).active = activate
    if (this.initialActivationCallback && activate && !this.initiallyActivated) {
      (this as any).initiallyActivated = true
      this.initialActivationCallback()
    }

    if (this.activationCallback) return this.activationCallback(activate)
  }
  public domainFragmentToLoadUid?: boolean | ((domainFrag: string) => ID)
  
  stl() {
    return super.stl() + require("./frame.css").toString()
  }
  public async minimalContentPaint(loadUid: string): Promise<void> {
    await this.records.get(loadUid).minimal()
  }
  public async fullContentPaint(loadUid: string): Promise<void> {
    await this.records.get(loadUid).content()
  }
  public async completePaint(loadUid: string): Promise<void> {
    await this.records.get(loadUid).full()
  }

  //  TODO dont memoize this, as temporary network errors can later be resolved. TryNav can be network dependent, like for ghostBlogPage.
  public tryNavigate = keyIndex(this._tryNavigate.bind(this)) as typeof this["_tryNavigate"]

  private firstTryNav = true
  public async _tryNavigate(domainFragment?: string) {
    const loadUid = this.domainFragmentToLoadUid !== undefined ? this.domainFragmentToLoadUid === true ? domainFragment : (this as any).domainFragmentToLoadUid(domainFragment) : undefined
    let myRecords: {minimal: Recording, content: Recording, full: Recording}
    if (this.firstTryNav) {
      myRecords = this.records.get(undefined)
      this.firstTryNav = false
      if (loadUid !== undefined) {
        this.records.set(loadUid, this.records.get(undefined))
        this.records.delete(undefined)
      }
    }
    else {
      if (!this.records.has(loadUid)) this.records.set(loadUid, myRecords = makeRec(this.nameP))
      else myRecords = this.records.get(loadUid)
    }

    let res = true
    let tryRet: unknown
    if (this.tryNavigationCallback !== undefined) {
      
      try {
        tryRet = await this.tryNavigationCallback(domainFragment) as boolean
        if (tryRet === undefined || !!tryRet) res = true
        else res = false
      }
      catch(e) {
        console.error("Non standard tryNavigationCallback fail. Caused by", e)
        res = false
      }
      
    }

    if (this.attachStructureCallback !== undefined && res) {
      for (const key in myRecords) loadRecord[key as "minimal"].record(myRecords[key])
      this.attachStructureCallback(tryRet !== undefined ? tryRet : domainFragment)
    }


    
    

    return res
  }
  public attachStructureCallback?(domainFragment: unknown): void
  /**
   * @return resolve Promise as soon as you know if the navigation will be successful or not. Dont wait for swap animation etc
   */
  protected tryNavigationCallback?(domainFragment: string): boolean | unknown | void | Promise<boolean | unknown | void>

  protected activationCallback?(active: boolean): void
  protected initialActivationCallback?(): void
  public userInitedScrollEvent: boolean
  public addIntersectionListener?(root: HTMLElement, cb: Function, threshold?: number, rootMargin?: string): void
  public removeIntersectionListener?(root: HTMLElement): void
}