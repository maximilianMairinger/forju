import ThemeAble, { Theme } from "../themeAble";
import { StackedAsyncTaskRecord } from "../../../lib/record";
import { Data } from "josm";
import keyIndex from "key-index";

const resolveAddOnEmpty = (func: Function) => {
  func()
}

export const loadRecord = {
  minimal: new StackedAsyncTaskRecord(resolveAddOnEmpty),
  content: new StackedAsyncTaskRecord(resolveAddOnEmpty),
  full: new StackedAsyncTaskRecord(resolveAddOnEmpty)
}

type ID = unknown
type Recording = ReturnType<typeof loadRecord.minimal.record>

function makeRec() {
  return {
    minimal: loadRecord.minimal.record(),
    content: loadRecord.content.record(),
    full: loadRecord.full.record()
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



  constructor(theme: Theme) {
    const initRec = makeRec()
    super(undefined, theme)
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
    // if (domainFragment === 'willkommen-wissenschaftler-von-morgen') debugger
    
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
      if (!this.records.has(loadUid)) this.records.set(loadUid, myRecords = makeRec())
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
      catch(e) {res = false}
      
    }

    if (this.attachStructureCallback !== undefined && res) {
      for (const key in myRecords) loadRecord[key as "minimal"].record(myRecords[key])
      this.attachStructureCallback(tryRet !== undefined ? tryRet : domainFragment)
    }


    
    
    if (!res) {
      // clear them from stack
      const rec = this.records.get(loadUid)
      this.records.delete(loadUid)
      rec.minimal()
      rec.content()
      rec.full()
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