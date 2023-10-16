import { declareComponent } from "../../../../../../lib/declareComponent"
import BlogPage from "../blogPage"
import { dirString, domainIndex } from "../../../../../../lib/domain";




export default class LegalPage extends BlogPage {

  constructor() {
    super(require("./legal.pug").default)
    
    
  }


}

declareComponent("legal-page", LegalPage)