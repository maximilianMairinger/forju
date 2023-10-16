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
  public async tryNavigate(domainFragment?: string) {
    let res = true
    if (this.tryNavigationCallback) {
      let acRes = await this.tryNavigationCallback(domainFragment)
      if (acRes === undefined) acRes = true
      if (!acRes) res = false
    }
    
    return res
  }
  public navigate() {
    if (this.navigationCallback) this.navigationCallback()
  }


  /**
   * @return resolve Promise as soon as you know if the navigation will be successful or not. Dont wait for swap animation etc
   */
  protected tryNavigationCallback?(domainFragment: string): boolean | void | Promise<boolean | void>
  protected navigationCallback?(): Promise<void>
  protected initialActivationCallback?(): boolean | void | Promise<boolean | void>
  stl() {
    return super.stl() + require("./page.css").toString()
  }
}