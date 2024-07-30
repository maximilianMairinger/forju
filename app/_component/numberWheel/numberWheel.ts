import declareComponent from "../../lib/declareComponent"
import Component from "../component"
import keyIndex from "key-index"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import DigitWheel from "../digitWheel/digitWheel";
import animFrameDelta from "animation-frame-delta"


import { Easing } from "waapi-easing"
const easeF = new Easing("ease").function


export default class NumberWheel extends Component<false> {
  protected body: BodyTypes

  private digitElems = keyIndex((digit: number) => {
    const elem = new DigitWheel(0)
    this.shadowRoot.prepend(elem)
    return elem
  })

  constructor() {
    super(false)

    // @ts-ignore
    window.numberWheel = this

  }

  private prevVal: number
  value(value: number, increment = 1) {
    const incrementFactor = increment ** -1
    // todo increment

    const digitsCount = getNumberOfDigits(value * incrementFactor)
    const digitElems = [] as DigitWheel[]
    for (let i = 0; i < digitsCount; i++) {
      digitElems.push(this.digitElems(i))
    }

    const animFuncs = digitElems.map((elem, i) => elem.value(value, i))

    this.prevVal = value
    return (prog: number) => {
      for (const func of animFuncs) {
        func(prog)
      }
    }
  }

  animateValueTo(toValue: number | {to: number, increment: number}, speedInNumbersPerSecond: number = 10, easingF: (prog: number) => number = easeF) {
    if (this.prevVal === undefined) this.value(typeof toValue === "number" ? toValue : toValue.to)
    else {
      const increment = typeof toValue === "number" ? 1 : toValue.increment
      const fromValue = this.prevVal
      const to = typeof toValue === "number" ? toValue : toValue.to
      const distance = Math.abs(to - fromValue)
      const dur = 1000 * distance / speedInNumbersPerSecond

      const animF = this.value(to, increment)
      return animFrameDelta((progAbs) => {
        animF(easingF(progAbs / dur))
      }, dur)
    }
  }

  digitCount(digitsCount: number) {
    digitsCount = +digitsCount
    for (let i = 0; i < digitsCount; i++) {
      this.digitElems(i)
    }
  }

  stl() {
    return super.stl() + require("./numberWheel.css").toString()
  }
  pug() {
    return require("./numberWheel.pug").default
  }
}

declareComponent("c-number-wheel", NumberWheel)


function getNumberOfDigits(number: number) {
  if (number === 0) return 1;  // Edge case for 0
  return Math.floor(Math.log10(Math.abs(number))) + 1;
}
