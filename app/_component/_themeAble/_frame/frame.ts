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
type Recording = () => Promise<unknown[]>

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




  private firstTryNav = true
  public async tryNavigate(domainFragment?: string) {
    let res = true
    const loadUid = this.domainFragmentToLoadUid !== undefined ? this.domainFragmentToLoadUid === true ? domainFragment : (this as any).domainFragmentToLoadUid(domainFragment) : undefined
    if (this.firstTryNav) {
      this.firstTryNav = false
      if (loadUid !== undefined) {
        this.records.set(loadUid, this.records.get(undefined))
        this.records.delete(undefined)
      }
    }
    else {
      if (!this.records.has(loadUid)) this.records.set(loadUid, makeRec())
    }

    if (this.tryNavigationCallback) {
      let acRes = await this.tryNavigationCallback(domainFragment)
      if (acRes === undefined) acRes = true
      if (!acRes) res = false
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

  /**
   * @return resolve Promise as soon as you know if the navigation will be successful or not. Dont wait for swap animation etc
   */
  protected tryNavigationCallback?(domainFragment: string): boolean | void | Promise<boolean | void>

  protected activationCallback?(active: boolean): void
  protected initialActivationCallback?(): void
  public userInitedScrollEvent: boolean
  public addIntersectionListener?(root: HTMLElement, cb: Function, threshold?: number, rootMargin?: string): void
  public removeIntersectionListener?(root: HTMLElement): void
}