import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import ToggleSwitch from "../../../_focusAble/_formUi/toggleSwitch/toggleSwitch"
import { loadRecord } from "../../frame"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

export default class JobsLandingSection extends PageSection {
  private toggleSwitch: ToggleSwitch
  protected body: BodyTypes
  private isLightOn = false

  constructor() {
    super("dark")

    const toggleSwitch = this.body.toggleSwitch
    
    // Check if it's actually a ToggleSwitch instance (custom element has been upgraded)
    this.toggleSwitch = toggleSwitch
    
    // this.toggleSwitch.toggled.get((toggled) => {
    //   this.isLightOn = toggled
    //   if (toggled) {
    //     this.lightOn()
    //   } else {
    //     this.lightOff()
    //   }
    // })


    loadRecord.full.add(async () => {
      await this.body.bg.loadAnimations()
    })
  }

  // private async lightOn() {
  //   this.addClass("light-on")
    
  //   // Animate triangles in
  //   const triangles = this.q(".triangle", true)
  //   triangles.ea((triangle, index) => {
  //     setTimeout(() => {
  //       triangle.classList.add("visible")
  //     }, index * 150)
  //   })

  //   // Animate paperboat
  //   const paperboat = this.q(".paperboat") as HTMLElement
  //   setTimeout(() => {
  //     if (paperboat) paperboat.classList.add("visible")
  //   }, 300)
  // }

  // private async lightOff() {
  //   this.removeClass("light-on")
    
  //   // Hide all elements
  //   const triangles = this.q(".triangle", true)
  //   triangles.ea(triangle => {
  //     triangle.classList.remove("visible")
  //   })

  //   const paperboat = this.q(".paperboat") as HTMLElement
  //   if (paperboat) paperboat.classList.remove("visible")
  // }

  stl() {
    return super.stl() + require("./jobsLandingSection.css").toString()
  }
  pug() {
    return require("./jobsLandingSection.pug").default
  }
}

declareComponent("c-jobs-landing-section", JobsLandingSection)
