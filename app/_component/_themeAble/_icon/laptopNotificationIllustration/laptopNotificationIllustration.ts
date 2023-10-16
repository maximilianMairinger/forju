import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class LaptopNotificationIllustration extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./laptopNotificationIllustration.pug").default
  }
}

declareComponent("laptop-notification-illustration", LaptopNotificationIllustration)