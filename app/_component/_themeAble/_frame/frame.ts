import ThemeAble, { Theme } from "../themeAble";
import { InstanceRecord } from "../../../lib/record";
import { Data } from "josm";

export const loadRecord = {
  minimal: new InstanceRecord(() => {}),
  content: new InstanceRecord(() => {}),
  full: new InstanceRecord(() => {})
}


type Recording = () => () => Promise<any>



export default abstract class Frame extends ThemeAble<HTMLElement> {
  public readonly accentTheme: Data<"primary" | "secondary">


  public readonly active: boolean;
  public readonly initiallyActivated: boolean

  private minimalRec: Recording
  private contentRec: Recording
  private fullRec: Recording

  constructor(theme: Theme) {
    const minimal = loadRecord.minimal.record()
    const content = loadRecord.content.record()
    const full = loadRecord.full.record()
    super(undefined, theme)
    this.accentTheme = new Data("primary") as Data<"primary" | "secondary">

    this.minimalRec = minimal
    this.contentRec = content
    this.fullRec = full

    

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
  
  stl() {
    return super.stl() + require("./frame.css").toString()
  }
  public async minimalContentPaint(): Promise<void> {
    await this.minimalRec()()
  }
  public async fullContentPaint(): Promise<void> {
    await this.contentRec()()
  }
  public async completePaint(): Promise<void> {
    await this.fullRec()()
  }

  protected activationCallback?(active: boolean): void
  protected initialActivationCallback?(): void
  public userInitedScrollEvent: boolean
  public addIntersectionListener?(root: HTMLElement, cb: Function, threshold?: number, rootMargin?: string): void
  public removeIntersectionListener?(root: HTMLElement): void
}