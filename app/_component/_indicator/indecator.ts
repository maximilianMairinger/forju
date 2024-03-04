import Component from "../component";


export default abstract class Indecator extends Component {
  constructor(protected indicator: HTMLElement) {
    super()
    this.apd(indicator)
  }
  protected async indicate() {
    this.indicator.anim({opacity: 1})
  }
  protected async removeIndecation() {
    this.indicator.anim({opacity: 0})
  }
  stl() {
    return super.stl() + require('./indecator.css').toString();
  }
}