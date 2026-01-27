import declareComponent from "../../../../../../../lib/declareComponent"
import LazySectionedPage from "../lazySectionedPage"
import { BodyTypes } from "./pugBody.gen"; import "./pugBody.gen"
import { Import, ImportanceMap } from "../../../../../../../lib/lazyLoad"
import JobsLandingSection from "../../../../_pageSection/jobsLandingSection/jobsLandingSection"
import HighlightAbleIcon from "../../../../../_icon/_highlightAbleIcon/highlightAbleIcon"

export default class JobsPage extends LazySectionedPage {
  protected body: BodyTypes
  public iconIndex: { [key: string]: HighlightAbleIcon } = {}

  constructor(baselink: string, sectionChangeCallback?: (section: string) => void) {
    super(new ImportanceMap<() => Promise<any>, any>(
      {
        key: new Import("", 1, (jobsLandingSection: typeof JobsLandingSection) =>
          new jobsLandingSection()
        ), val: () => import(/* webpackChunkName: "jobsLandingSection" */"../../../../_pageSection/jobsLandingSection/jobsLandingSection")
      }
    ), baselink, sectionChangeCallback)
  }

  stl() {
    return super.stl() + require("./jobsPage.css").toString()
  }
  pug() {
    return require("./jobsPage.pug").default
  }
}

declareComponent("c-jobs-page", JobsPage)
