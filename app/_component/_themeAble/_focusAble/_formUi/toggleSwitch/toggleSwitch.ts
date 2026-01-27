import FormUi from "../formUi";
import Button from "../../_button/button";
import declareComponent from "../../../../../lib/declareComponent";
import { Data } from "josm";

type ReadonlyData<T> = Omit<Data<T>, "set">

export default class ToggleSwitch extends FormUi<Button> {
  public button: Button
  public toggled = new Data(false) as ReadonlyData<boolean>
  public preToggled = new Data(false) as ReadonlyData<boolean>

  constructor(toggleCallback?: (toggled: boolean) => void) {
    const button = new Button()
    super(button);

    this.moveBody.append(ce("switch-knob"))

    this.button = button
    button.userFeedbackMode.focus.set(false)

    if (toggleCallback) this.toggled.get(toggleCallback)

    this.preToggled.get((preToggled) => {
      if (preToggled) this.addClass("preToggled")
      else this.removeClass("preToggled")
    })

    this.userFeedbackMode.ripple.set(false)
    this.userFeedbackMode.hover.set(false)

    this.button.addActivationCallback(() => {
      (this.toggled as Data<boolean>).set(!this.toggled.get())
    })

    this.toggled.get((toggled) => {
      if (toggled) this.addClass("toggled")
      else this.removeClass("toggled")
    }, false)
  }
  
  stl() {
    return super.stl() + require('./toggleSwitch.css').toString();
  }
  pug() {
    return super.pug() + require("./toggleSwitch.pug").default
  }
}

declareComponent("c-toggle-switch", ToggleSwitch)
