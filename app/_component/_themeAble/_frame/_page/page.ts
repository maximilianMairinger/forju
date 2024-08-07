import lazyLoad from "../../../../lib/lazyLoad";
import { linkRecord } from "../../link/link";
import { Theme } from "../../themeAble";
import Frame from "../frame";




export default abstract class Page extends Frame {
  public domainLevel?: number
  public readonly defaultDomain: string = ""
  constructor(theme?: Theme) {
    super(theme)

  }


  public navigate(loadId: string) {
    if (this.navigationCallback) this.navigationCallback(loadId)
  }

  protected tryNavigationCallback(domainFragment: string): boolean | unknown | void | Promise<boolean | unknown | void> {
    return domainFragment === ""
  }


  
  protected navigationCallback?(loadId: unknown): Promise<void>

  
  
  protected initialActivationCallback?(): boolean | void | Promise<boolean | void>
  stl() {
    return super.stl() + require("./page.css").toString()
  }
}