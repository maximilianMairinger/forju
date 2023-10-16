import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";
import { Data } from "josm";




export default class TgmLogoDots extends Icon {
  private main = this.q("g#body") as SVGElement
  private svgElem = this.q("svg") as SVGElement
  constructor() {
    super()

    const count: Data<number> = new Data()
    count.get((count) => {
      this.generate(count / 1.3 + 6)
    }, false)
    this.on("resize", (e) => {
      count.set(Math.round(e.width * 0.09))
    })


  }

  private generate(pointsPerSide: number) {
    const offset = 26 / pointsPerSide
    const pointsMargin = offset * 11
    const pointsDiameter = (offset * 2.5)
    const pointsDiameterStr = pointsDiameter + ""

    
    this.main.emptyNodes()
    this.main.apd(require("./oneDot.pug").default)
    const template = this.main.childs() as HTMLElement
    template.setAttribute("cy", pointsDiameterStr)
    template.setAttribute("r", pointsDiameterStr)
    template.css("transform", "translate(0 0)")
    let outer = 0
    let inner = 1
    for (; outer < pointsPerSide; outer++) {
      const outerMargin = outer * pointsMargin
      for (; inner < pointsPerSide; inner++) {
        const node = template.cloneNode() as SVGElement
        node.setAttribute("transform", `translate(${inner * pointsMargin} ${outerMargin})`)
        this.main.apd(node)
      }
      inner = outer + 1
    }

    template.cloneNode()
  }


  pug() {
    return require("./tgmLogoDots.pug").default
  }
}

declareComponent("tgm-logo-dots", TgmLogoDots)
