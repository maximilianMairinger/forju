import Indecator from "../indecator";
import { declareComponent } from "./../../../lib/declareComponent"

export default declareComponent("loading-indecator", class loadingIndecator extends Indecator {
  constructor(start: boolean = true, public dimension?: {width: number, height: number}) {
    super();
    if (start) this.start();
  }
  public start() {
    let loader = ce("loading-element")
    if (this.dimension !== undefined) {
      loader.css(this.dimension);
      loader.css({width: 123, height: 32})
      /**                                                                        (7.5 * 2) */
      loader.css("borderWidth", (this.dimension.width + this.dimension.height) / (15));
    }
    this.indecate(loader)
    
    loader.anim([
      {rotateZ: 0, offset: 0},
      {rotateZ: 360, offset: 1}
    ],
    {iterations: Infinity, duration: 1000, easing: "linear", fill: false})
  }
  public async stop() {
    this.removeIndecation()
  }
  
  stl() {
    return super.stl() + require('./loadingIndecator.css').toString();
  }
  pug() {
    return ""
  }
})
