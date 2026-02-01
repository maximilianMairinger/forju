import declareComponent from "../../../../../../../lib/declareComponent"
import { Import, ImportanceMap } from "../../../../../../../lib/lazyLoad";
import LazySectionedPage from "../lazySectionedPage"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"

import TeamIcon from "../../../../../_icon/_highlightAbleIcon/teamIcon/teamIcon"
import ContactIcon from "../../../../../_icon/_highlightAbleIcon/contact/contact"
import FooterSection from "../../../../_pageSection/footerSection/footerSection"
import PresseBlogSection from "../../../../_pageSection/_leftRightSection/blogDisplaySection/presseaussendungenBlogSection/presseaussendungenBlogSection";
import ThoughtBubbleIcon from "../../../../../_icon/_highlightAbleIcon/thoughtBubbleIcon/thoughtBubbleIcon"



export default class TeamPage extends LazySectionedPage {
  protected body: BodyTypes

  iconIndex = {
    about: new ContactIcon(),
    funktionaere: new TeamIcon(),
    kinderschutz: new ThoughtBubbleIcon()
  }

  constructor(baselink: string, sectionChangeCallback?: (section: string) => void) {
    super(new ImportanceMap<() => Promise<any>, any>(
      {
        key: new Import("about", 1, (aboutSection: any) =>
          new aboutSection()
        ), val: () => import(/* webpackChunkName: "aboutSection" */"../../../../_pageSection/aboutSection/aboutSection")
      },
      {
        key: new Import("funktionaere", 1, (funktionaereSection: any) =>
          new funktionaereSection()
        ), val: () => import(/* f: "funktionaereSection" */"../../../../_pageSection/teamSection/funktionaereSection/funktionaereSection")
      },
      {
        key: new Import("kinderschutz", 1, (kinderschutzSection: any) =>
          new kinderschutzSection()
        ), val: () => import(/* webpackChunkName: "kinderschutzSection" */"../../../../_pageSection/miniTeamSection/kinderschutzTeamSection/kinderschutzTeamSection")
      },
      {
        key: new Import("footer", 1, (footerSection: typeof FooterSection) =>
          new footerSection()
        ), val: () => import(/* webpackChunkName: "footerSection" */"../../../../_pageSection/footerSection/footerSection")
      }
    ), baselink, sectionChangeCallback, undefined, {
      footer: "kinderschutz"
    })
  }

  stl() {
    return super.stl() + require("./teamPage.css").toString()
  }
  pug() {
    return require("./teamPage.pug").default
  }
}

declareComponent("c-team-page", TeamPage)
