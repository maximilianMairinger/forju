import declareComponent from "../../lib/declareComponent"
import Component from "../component"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import { Borrow } from "more-maps";
import keyIndex from "key-index";
import { clamp, probRange } from "../../lib/util";


const translateEndTemplate = "px)"
class Elem {
  curVal: number
  private isCurSelectAble = true
  private translateTemplate: `translate${"X" | "Y"}(`
  constructor(public elem: HTMLElement, dir: "y" | "x" = "y") {
    this.translateTemplate = `translate${dir.toUpperCase()}(` as any
  }

  setPos(n: number) {
    this.elem.style.transform = this.translateTemplate + n + translateEndTemplate
    return this
  }
  setVal(n: number) {
    n = +n
    if (this.curVal === n) return this
    this.elem.txt(n.toString(), false)
    this.curVal = n
    return this
  }
  setSelectable(selectAble: boolean) {
    if (this.isCurSelectAble === selectAble) return this
    this.isCurSelectAble = selectAble
    this.elem.css("userSelect", selectAble ? "auto" : "none")
    return this
  }
}

class ElemIndex extends Array<Elem> {
  getElemFromVal(val: number) {
    if (this[0]?.curVal === val) return this[0]
    if (this[1]?.curVal === val) return this[1]
  }
  setElemValLazy(val1?: number, val2?: number) {
    if (val1 !== undefined) this[0].setVal(val1)
    if (val2 !== undefined) this[1].setVal(val2)
    return this
  }
}

export default class DigitWheel extends Component<false> {
  protected body: BodyTypes
  private elemIndex = new ElemIndex(
    new Elem(this.mkElem()),
    new Elem(this.mkElem())
   )



  private mkElem() {
    const elem = document.createElement("span")
    this.componentBody.prepend(elem)
    // elem.txt(val.toString())
    return elem
  }

  public direction = "y" as "x" | "y"
  public inverse = false

  constructor(initValue?: number) {
    super(false)

    if (initValue !== undefined) this.value(initValue)

 
    this.resizeDataBase()(({height}) => {
      // listen on the parent, as on the child, the the size changes during anim
      this.elemHeight = height
    })
  }

  // private _hideInitState: boolean = false
  // hideInitState(to: boolean) {
  //   to = !!to
  //   if (this.initElem === undefined) this._hideInitState = to
  //   else {
  //     changeVis(this.initElem, !to)
  //   }
  // }


  private elemHeight: number
  private prevVal: number
  value(to: number, digit: number = 0) {
    to = +to
    
    if (to === this.prevVal) return

    
    if (this.prevVal === undefined) { // init set
      const setVal = (to * 10**digit) % 10
      const [ { elem } ] = this.elemIndex.setElemValLazy(setVal)

      
      
      // changeVis(elem, !this._hideInitState)
      // change vis back when no longer in use
      this.prevVal = to
    }
    else {
      let intervalLength = to - this.prevVal
      const sign = Math.sign(intervalLength)
      const inverse = sign === -1
      intervalLength = Math.abs(intervalLength)
      let thisPrevVal = this.prevVal
      if (inverse) thisPrevVal = to
      


      this.prevVal = to

      const digitExpMin1 = 10**(digit-1)
      const digitExp = digitExpMin1 * 10
      const topCutExp = digit === 0 ? 10 : digitExp
      
      return (prog: number) => {
        prog = probRange(prog)
        if (inverse) prog = 1 - prog
        let toExact = intervalLength * prog + thisPrevVal
        
        let nextVal = Math.ceil(toExact)
        let prevVal = Math.floor(toExact)
        const nextValCut = Math.floor(nextVal / digitExp) % topCutExp
        const prevValCut = Math.floor(prevVal / digitExp) % topCutExp
        
        

        const exactMatch = nextValCut === prevValCut
        if (exactMatch) { // exact match, only one number on screen
          this.elemIndex.setElemValLazy(nextValCut)
        }
        else {
          this.elemIndex.setElemValLazy(prevValCut, nextValCut)
        }



        const distanceToPrev = ((toExact / digitExp) % topCutExp) - prevValCut


        const thresholdForAnimation = 1 - 10**-digit
        if (distanceToPrev/* % 10**digit */ >= thresholdForAnimation) {
          const myDistanceToPrev = ((distanceToPrev - thresholdForAnimation) * digitExp) % 1 // should have a range of 0-1 now again
          const is0PrimarilyOnScreen = myDistanceToPrev < .5
          this.elemIndex[0].setSelectable(is0PrimarilyOnScreen).setPos(myDistanceToPrev * this.elemHeight)
          this.elemIndex[1].setSelectable(!is0PrimarilyOnScreen).setPos(-1 * (1 - myDistanceToPrev) * this.elemHeight)
        }
        else {
          this.elemIndex[0].setSelectable(true).setPos(0)
          this.elemIndex[1].setSelectable(false).setPos(this.elemHeight)
        }
        
        
        

        // const setVal = (to * 10**digit) % 10

      }
    }

    
  }
  

  stl() {
    return super.stl() + require("./digitWheel.css").toString()
  }
  pug() {
    return require("./digitWheel.pug").default
  }
}



declareComponent("c-digit-wheel", DigitWheel)
