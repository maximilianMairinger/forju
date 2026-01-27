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
    
    this.body.toggleSwitch.toggled.get((toggled) => {
      this.isLightOn = toggled
      if (toggled) {
        // scroll down a bit??
        this.body.bg.anim({
          backgroundColor: "white"
        })
        this.body.heading.anim({color: "black"})
        
      } else {
        this.body.bg.anim({backgroundColor: "black"})
        this.body.heading.anim({color: "white"})
      }
    })


    loadRecord.full.add(async () => {
      await this.body.bg.loadAnimations()

      const font = new FontFace('Permanent Marker', 'url(https://fonts.gstatic.com/s/permanentmarker/v16/Fh4uPib9Iyv2ucM6pGQMWimMp004La2Cf5b6jlg.woff2) format(\'woff2\')', {
        style: "normal",
        weight: "400"
      });

      document.fonts.add(font);

      font.load().then((loadedFont) => {
        this.body.switchLabel.anim({opacity: 1})
      })

//       document.head.insertAdjacentHTML("beforeend", `
// <link rel="preconnect" href="https://fonts.googleapis.com">
// <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
// <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap" rel="stylesheet">
//       `)


    })
  }


  stl() {
    return super.stl() + require("./jobsLandingSection.css").toString()
  }
  pug() {
    return require("./jobsLandingSection.pug").default
  }
}

declareComponent("c-jobs-landing-section", JobsLandingSection)
