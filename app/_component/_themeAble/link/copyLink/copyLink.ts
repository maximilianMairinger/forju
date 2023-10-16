import declareComponent from "../../../../lib/declareComponent"
import Link from "../link";
import copyToClipboard from "copy-to-clipboard"
import delay from "delay"
import lang from "../../../../lib/lang";
import { loadRecord } from "../../_frame/frame";

function selectText(node: Node) {
if (window.getSelection) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(node);
      selection.removeAllRanges();
      selection.addRange(range);
  } else {
      return false
  }
  return true
}


export default class CopyLink extends Link {
  constructor(content: string, private _copyText?: string) {
    super(content)


    let copyFeedback: () => any = async () => {
      const content = this.content()
      this.content(lang.copiedFeedback.get())
      await delay(600)
      this.content(content)
    }

    loadRecord.full.add(async () => {
      copyFeedback = (await import("./tippyFeedback")).default(this)
    })
    
    this.addActivationListener(() => {  
      const suc = copyToClipboard(this._copyText !== undefined ? this._copyText : this.content()) 
      if (suc) copyFeedback()
      else {
        this.css({userSelect: "all"})
        selectText(this)
      }
    })
  }

  copyText(text: string) {
    this._copyText = text
    return this
  }
}

declareComponent("copy-link", CopyLink)
