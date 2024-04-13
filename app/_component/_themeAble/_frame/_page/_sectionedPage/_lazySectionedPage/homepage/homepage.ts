import declareComponent from "../../../../../../../lib/declareComponent"
import { Import, ImportanceMap } from "../../../../../../../lib/lazyLoad"
import LandingSection from "../../../../_pageSection/landingSection/landingSection"
import WorkSection from "../../../../_pageSection/workSection/workSection"
import ServicesSection from "../../../../_pageSection/servicesSection/servicesSection"
import PartnerSection from "../../../../_pageSection/partnerSection/partnerSection"
import TeamSection from "../../../../_pageSection/teamSection/teamSection"
import FooterSection from "../../../../_pageSection/footerSection/footerSection"

import TestSection from "../../../../_pageSection/testSection/testSection"
import LazySectionedPage from "../lazySectionedPage"
import HightlightAbleIcon from "../../../../../_icon/_highlightAbleIcon/highlightAbleIcon"
import ThoughtBubbleIcon from "../../../../../_icon/_highlightAbleIcon/thoughtBubble/thoughtBubble"
import RocketIcon from "../../../../../_icon/_highlightAbleIcon/rocket/rocket"
import TeamIcon from "../../../../../_icon/_highlightAbleIcon/teamIcon/teamIcon"
import ContactIcon from "../../../../../_icon/_highlightAbleIcon/contact/contact"



export default class HomePage extends LazySectionedPage {

  public iconIndex: {[key: string]: HightlightAbleIcon}

  constructor(baselink: string, sectionChangeCallback?: (section: string) => void) {

    super(new ImportanceMap<() => Promise<any>, any>(
      {
        key: new Import("", 1, (landingSection: typeof LandingSection) =>
          new landingSection()
        ), val: () => import(/* webpackChunkName: "landingSection" */"../../../../_pageSection/landingSection/landingSection")
      },
      {
        key: new Import("services", 1, (servicesSection: typeof ServicesSection) =>
          new servicesSection()
        ), val: () => import(/* webpackChunkName: "servicesSection" */"../../../../_pageSection/servicesSection/servicesSection")
      },
      // {
      //   key: new Import("team", 1, (teamSection: typeof TeamSection) =>
      //     new teamSection()
      //   ), val: () => import(/* webpackChunkName: "teamSection" */"../../../../_pageSection/teamSection/teamSection")
      // },
      {
        key: new Import("partner", 1, (partnerSection: typeof PartnerSection) =>
          new partnerSection()
        ), val: () => import(/* webpackChunkName: "partnerSection" */"../../../../_pageSection/partnerSection/partnerSection")
      },
      {
        key: new Import("contact", 1, (footerSection: typeof FooterSection) =>
          new footerSection()
        ), val: () => import(/* webpackChunkName: "footerSection" */"../../../../_pageSection/footerSection/footerSection")
      },
    ), baselink, sectionChangeCallback, undefined, {
      footer: "team"
    })



    this.iconIndex = {
      services: new RocketIcon(),
      team: new TeamIcon(),
      contact: new ContactIcon()
    }
  }

  stl() {
    return super.stl() + require("./homepage.css").toString()
  }
  pug() {
    return require("./homepage.pug").default
  }
}

declareComponent("home-page", HomePage)
