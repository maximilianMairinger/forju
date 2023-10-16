import Component from "../component";


export default abstract class Indecator extends Component {
  private container: HTMLElement = ce("indecator-container");
  private ongoingAnimation: Promise<void>;
  constructor() {
    super();
    this.sra(this.container);
  }
  protected async indecate(elem: HTMLElement | string) {
    await this.ongoingAnimation
    this.container.apd(elem)
  }
  protected async removeIndecation() {
    await this.ongoingAnimation
    let elem = this.container.childs()
    this.ongoingAnimation = elem.anim({opacity: 0})
    await this.ongoingAnimation
    elem.remove()
    this.ongoingAnimation = undefined
  }
  stl() {
    return super.stl() + require('./indecator.css').toString();
  }
}