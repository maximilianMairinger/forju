import declareComponent from "../../lib/declareComponent"
import Component from "../component"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import { Borrow } from "more-maps";
import keyIndex from "key-index";
import { clamp, probRange } from "../../lib/util";

type Elem = {elem: HTMLElement, curVal: number, setVal(n: number): void}

export default class DigitWheel extends Component<false> {
  protected body: BodyTypes
  private elemIndex = [{
    elem: this.mkElem(),
    setVal(val: number) {
      (this.elem as HTMLElement).txt(val.toString(), false)
      this.curVal = val
    },
    curVal: undefined
  }, {
    elem: this.mkElem(),
    setVal(val: number) {
      (this.elem as HTMLElement).txt(val.toString(), false)
      this.curVal = val
    },
    curVal: undefined
  }] as any as [Elem, Elem] & {getElemFromVal(val: number): Elem, setElemValLazy(val1?: number, val2?: number): [Elem, Elem]}



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

    const elemIndex = this.elemIndex
    elemIndex.getElemFromVal = function(val: number) {
      if (elemIndex[0]?.curVal === val) return elemIndex[0]
      if (elemIndex[1]?.curVal === val) return elemIndex[1]
    }
    elemIndex.setElemValLazy = function(val1?: number, val2?: number) {
      if (val1 !== undefined && elemIndex[0]?.curVal !== val1) elemIndex[0].setVal(val1)
      if (val2 !== undefined && elemIndex[1]?.curVal !== val2) elemIndex[1].setVal(val2)
      return this as any
    }

    if (initValue !== undefined) this.value(initValue)
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

      this.elemHeight = elem.offsetHeight
      setTimeout(() => {
        this.elemHeight = elem.offsetHeight
      })
      
      
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

        if (digit === 0) {
          const myDistanceToPrev = distanceToPrev
          this.elemIndex[0].elem.style.transform = `translateY(${myDistanceToPrev * this.elemHeight}px)`
          this.elemIndex[1].elem.style.transform = `translateY(${-1 * (1 - myDistanceToPrev) * this.elemHeight}px)`
        }
        else {
          const thresholdForAnimation = 1 - 10**-digit
          if (distanceToPrev/* % 10**digit */ >= thresholdForAnimation) {
            const myDistanceToPrev = ((distanceToPrev - thresholdForAnimation) * digitExp) % 1 // should have a range of 0-1 now again
            this.elemIndex[0].elem.style.transform = `translateY(${myDistanceToPrev * this.elemHeight}px)`
            this.elemIndex[1].elem.style.transform = `translateY(${-1 * (1 - myDistanceToPrev) * this.elemHeight}px)`
          }
          else {
            this.elemIndex[0].elem.style.transform = `translateY(0px)`
            this.elemIndex[1].elem.style.transform = `translateY(${this.elemHeight}px)`
          }
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


function animationStepFuncGen(digit: number, maxHeight: number) {

  return function(progAbs: number) {
    
  }
}

function changeVis(elem: Element, show: boolean) {
  elem.css({
    opacity: show ? 1 : 0,
    userSelect: show ? "all" : "none",
  })
}

function* range(from: number, to: number, step = 1) {
  for (let i = from; i < to; i += step) {
    yield i
  }
}

declareComponent("c-digit-wheel", DigitWheel)
