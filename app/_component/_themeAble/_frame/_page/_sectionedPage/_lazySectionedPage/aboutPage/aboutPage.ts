import declareComponent from "../../../../../../../lib/declareComponent"
import LazySectionedPage from "../lazySectionedPage"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import { Import, ImportanceMap } from "../../../../../../../lib/lazyLoad"
import ThoughtBubbleIcon from "../../../../../_icon/_highlightAbleIcon/thoughtBubble/thoughtBubble"
import TeamIcon from "../../../../../_icon/_highlightAbleIcon/teamIcon/teamIcon"
import ContactIcon from "../../../../../_icon/_highlightAbleIcon/contact/contact"
import FooterSection from "../../../../_pageSection/footerSection/footerSection"
import ServicesSection from "../../../../_pageSection/servicesSection/servicesSection"
import HighlightAbleIcon from "../../../../../_icon/_highlightAbleIcon/highlightAbleIcon";
import RocketIcon from "../../../../../_icon/_highlightAbleIcon/rocket/rocket";

export default class AboutPage extends LazySectionedPage {
  protected body: BodyTypes
  public iconIndex: { [key: string]: HighlightAbleIcon; };

  constructor(baselink: string, sectionChangeCallback?: (section: string) => void) {
    super(new ImportanceMap<() => Promise<any>, any>(
      {
        key: new Import("us", 1, (aboutSection: any) =>
          new aboutSection()
        ), val: () => import(/* webpackChunkName: "aboutSection" */"../../../../_pageSection/aboutSection/aboutSection")
      },
      {
        key: new Import("services", 1, (servicesSection: typeof ServicesSection) =>
          new servicesSection().addClass("noBgSpike")
        ), val: () => import(/* webpackChunkName: "servicesSection" */"../../../../_pageSection/servicesSection/servicesSection")
      },
      {
        key: new Import("footer", 1, (footerSection: typeof FooterSection) =>
          new footerSection()
        ), val: () => import(/* webpackChunkName: "footerSection" */"../../../../_pageSection/footerSection/footerSection")
      },
    ), baselink, sectionChangeCallback, undefined, {
      footer: "services"
    })



    this.iconIndex = {
      services: new RocketIcon(),
      us: new TeamIcon(),
    }

  }

  stl() {
    return super.stl() + require("./aboutPage.css").toString()
  }
  pug() {
    return require("./aboutPage.pug").default
  }
}

declareComponent("c-about-page", AboutPage)
