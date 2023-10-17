import Icon from "../icon";
import declareComponent from "../../../lib/declareComponent";

export default class UsersIcon extends Icon {
  pug() {
    return require("./usersIcon.pug").default
  }
  stl() {
    return super.stl() + require("./usersIcon.css").toString()
  }
}

declareComponent("c-users-icon", UsersIcon)
