import Component from "../component"


export default abstract class Icon extends Component<false> {
  constructor() {
    super(false)
  }
  stl() {
    return require("./icon.css").toString()
  }
}
