import Indecator from "../indecator";
import { declareComponent } from "../../../lib/declareComponent"

export default declareComponent("loading-indecator", class LoadingIndicator extends Indecator {
  constructor(start: boolean = true, public dimension?: {width: number, height: number}) {
    super(ce("loading-element"));
    if (start) this.start();
  }
  public start() {
    if (this.dimension !== undefined) {
      this.indicator.css(this.dimension);
      this.indicator.css({width: 123, height: 32})
      /*                                                                         (7.5 * 2) */
      this.indicator.css("borderWidth", (this.dimension.width + this.dimension.height) / (15));
    }
    this.indicate()
  }
  connectedCallback() {
    setTimeout(() => {
      this.indicator.anim([
        {rotateZ: 0, offset: 0},
        {rotateZ: 360, offset: 1}
      ],
      {iterations: Infinity, duration: 1000, easing: "linear"})
    })
  }
  public async stop() {
    this.removeIndecation()
  }
  
  stl() {
    return super.stl() + require('./loadingIndicator.css').toString();
  }
  pug() {
    return ""
  }
})
