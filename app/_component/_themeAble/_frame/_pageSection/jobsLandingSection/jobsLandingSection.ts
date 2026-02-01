import declareComponent from "../../../../../lib/declareComponent"
import PageSection from "../pageSection"
import ToggleSwitch from "../../../_focusAble/_formUi/toggleSwitch/toggleSwitch"
import { loadRecord } from "../../frame"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import delay from "tiny-delay";
import { latestLatent } from "more-proms";

export default class JobsLandingSection extends PageSection {
  protected body: BodyTypes

  public toggled = this.body.toggleSwitch.toggled

  constructor() {
    super("dark")


    const turnOn = latestLatent(async () => {
      await delay(1000)
    }).then(async () => {
      this.theme.set("light")
      await delay(400)
    }).then(() => {
      this.body.heading.anim({color: "black"})
    })


    const turnOff = latestLatent(async () => {
      this.body.heading.anim({color: "white"})
      this.theme.set("dark")
    })
    
    this.toggled.get(latestLatent((toggled) => {
      if (toggled) return turnOn()
      else return turnOff()
    }), false)


    loadRecord.full.add(async () => {
      const font = new FontFace('Permanent Marker', 'url(https://fonts.gstatic.com/s/permanentmarker/v16/Fh4uPib9Iyv2ucM6pGQMWimMp004La2Cf5b6jlg.woff2) format(\'woff2\')', {
        style: "normal",
        weight: "400"
      });

      document.fonts.add(font);

      font.load().then((loadedFont) => {
        this.body.switchLabel.anim({opacity: 1})
      })
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
