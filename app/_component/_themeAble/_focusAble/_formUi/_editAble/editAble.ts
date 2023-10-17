import { Data, DataCollection } from "josm";
import FormUi from "../formUi";


type ReadonlyData<T> = Omit<Data<T>, "set">

export default class EditAble extends FormUi {


  public isEmpty: ReadonlyData<boolean>
  public value: ReadonlyData<string>

  protected placeholderContainer = ce("placeholder-container")

  protected placeholderText = ce("placeholder-text")

  protected placeholderUp: Data<boolean>
  constructor(protected inputElem: HTMLInputElement | HTMLTextAreaElement, placeholder = "") {
    super()
    inputElem.id = "editAble"
    this.moveBody.apd(this.placeholderContainer.apd(this.placeholderText))
    this.moveBody.apd(inputElem as any)


    this.userFeedbackMode.ripple.set(false)

    this.placeholder(placeholder)

    this.enabled.get((enabled) => {
      if (enabled) {
        this.inputElem.tabIndex = 0
        clickListener.activate()
      }
      else {
        this.inputElem.tabIndex = -1
        clickListener.deactivate()
      }
    }, false)




    const value = (this as any).value = new Data("")
    this.inputElem.on("input", () => {(this.value as Data<string>).set(this.inputElem.value)})
    const isEmpty = (this as any).isEmpty = value.tunnel((v) => v === "")

    this.placeholderUp = new Data(false) as any
    new DataCollection(this.isFocused as Data<boolean>, isEmpty).get((isFocused, isEmpty) => {
      this.placeholderUp.set(!isEmpty || isFocused)
    })





    let globalAnimDone: Symbol
    this.placeholderUp.get((up) => {


      let localAnimDone = globalAnimDone = Symbol()
      this.componentBody.removeClass("animDone")
      this.placeholderText.anim(up ? {paddingTop: 7, fontSize: 12} : {paddingTop: 14, fontSize: 14}, 200).then(() => {
        if (localAnimDone === globalAnimDone) this.componentBody.addClass("animDone")
      })
    })

    isEmpty.get((isEmpty) => {
      this.placeholderText.css({fontWeight: isEmpty ? "normal" : "bold"})
    })

    const clickListener = this.on("click", () => {
      inputElem.focus()
    })
  }
  focus() {
    this.inputElem.focus()
  }
  placeholder(to: string) {
    this.placeholderText.text(to)
  }
  public pug(): string {
    return super.pug() + require("./editAble.pug").default
  }
  stl() {
    return super.stl() + require("./editAble.css").toString()
  }

}