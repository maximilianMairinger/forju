import { Data } from "josm";
import Component from "../component";

export default abstract class ThemeAble<T extends false | HTMLElement | HTMLAnchorElement = false | HTMLElement> extends Component<T> {
  private themeStyleElement: HTMLStyleElement = ce("style")
  public theme: Data<Theme>

  constructor(componentBodyExtension?: HTMLElement | false, theme?: Theme | null) {
    super(componentBodyExtension as any)

    this._childThemeAbles = this.childThemeAbles ? this.q(this.childThemeAbles().join(","), true) as any as ThemeAble[] : []


    this.theme = new Data(theme, "light")

    this.theme.get((theme) => {

      this._childThemeAbles.Inner("theme").inner("set", [theme])
      this.setTheme(theme)
    })

    
    
    

    if (!(this.componentBody instanceof ShadowRoot)) this.sr.insertBefore(this.themeStyleElement, this.componentBody as HTMLElement)
    else this.shadowRoot.append(this.themeStyleElement)
  }

  private _theme: Theme

  private setTheme(to: Theme) {
    if (this.currentlyActiveTheme) this.themeStyleElement.html(themeIndex[to])
    this._theme = to
  }

  private _childThemeAbles: ThemeAble[]
  protected childThemeAbles?(): string[]
  


  public passiveTheme() {
    if (this.currentlyActiveTheme) {
      this.currentlyActiveTheme = false
      this.themeStyleElement.html("")
    }
    return this
  }
  protected currentlyActiveTheme: boolean = true

  public activeTheme() {
    if (!this.currentlyActiveTheme) {
      this.currentlyActiveTheme = true
      this.themeStyleElement.html(themeIndex[this._theme])
    }
    return this
  }

}

export type Theme = keyof typeof themeIndex

const themeIndex = {
  light: require("./light-theme.css"),
  dark: require("./dark-theme.css")
}


