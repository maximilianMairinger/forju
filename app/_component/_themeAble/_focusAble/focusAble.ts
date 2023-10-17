import { Data, DataBase } from "josm";
import declareComponent from "../../../lib/declareComponent";
import { EventListener } from "extended-dom"
import ThemeAble, { Theme } from "../themeAble";


export default class FocusAble<T extends false | HTMLElement | HTMLAnchorElement = false | HTMLElement> extends ThemeAble<T> {

  public userFeedbackMode = new DataBase({
    focus: "direct",
  }) as DataBase<{
    focus: boolean | "direct",
  }>
  protected focusManElem = ce("focus-man")
  constructor(componentBodyExtension?: HTMLElement | false, theme?: Theme | null) {
    super(componentBodyExtension, theme)

    super.apd(this.focusManElem)


    const clickFocusListener: EventListener[] = []
    let lastBlurListener: EventListener
    let lastMouseoutListener: EventListener
    clickFocusListener.add(
      this.on("mousedown", () => {
        this.addClass("clickFocus")
        if (lastBlurListener) {
          lastBlurListener.deactivate()
          lastBlurListener = undefined
        }
        setTimeout(() => {
          lastBlurListener = this.on("blur", () => {
            this.removeClass("clickFocus")
            lastBlurListener = undefined
          }, {once: true})
        })

      }, true),
      this.on("mouseup", () => {
        this.addClass("afterClickFocus")
        if (lastMouseoutListener) {
          lastMouseoutListener.deactivate()
          lastMouseoutListener = undefined
        }
        setTimeout(() => {
          this.on("mouseout", () => {
            this.removeClass("afterClickFocus")
            lastMouseoutListener = undefined
          }, {once: true})
        })


      }, true)
    )


    this.userFeedbackMode.focus.get((enable) => {
      if (!enable) {
        this.removeClass("clickFocus")
        this.removeClass("afterClickFocus")
        this.focusManElem.remove()
      }
      else {
        super.apd(this.focusManElem)
        if (enable === "direct") {
          clickFocusListener.Inner("activate", [])
        }
        else {
          clickFocusListener.Inner("deactivate", [])
          this.removeClass("afterClickFocus")
          this.removeClass("clickFocus")
        }
      }
    }, false)

  }
  diableFocusIndecation() {

  }
  public pug(): string {
    return require("./focusAble.pug").default
  }
  stl() {
    return super.stl() + require("./focusAble.css").toString()
  }

}