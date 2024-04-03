import BlockButton from "../blockButton";
import delay from "delay";
import declareComponent from "../../../../../../../lib/declareComponent";
import Easing from "waapi-easing";
import CheckIcon from "./../../../../../_icon/check/check"


export default class LoadButton extends BlockButton {

  constructor(content?: string, onClick?: ((e?: MouseEvent | KeyboardEvent) => any)) {
    super(content, onClick);


    const superClick = this.button.click.bind(this.button)
    //@ts-ignore
    this.button.click = (e?: any) => {
      const ret = superClick(e) as Promise<any[]> | Function
      if (e instanceof Function) return ret
      else {
        if (!this.enabled.get()) return
        this.enabled.set(false)
        
        const cbs = new Promise<any[]>((res) => {
          (ret as Promise<any[]>).then(arr => res(arr.flat())).catch((errF) => res([errF]))
        })
        
        const intrested = cbs.then(arr => !arr.clean().empty)
        const doneShowAnim = this.showLoadingAnimationFor(ret as Promise<any>);

        const doneAnim = intrested.then((yes) => 
          yes ? doneShowAnim.then(this.succLoading.bind(this)).catch(this.errorLoading.bind(this)) :
          doneShowAnim.then(this.stopLoading.bind(this)).catch(this.errorLoading.bind(this))
        )
        
        cbs.then((cbs) => {
          for (const f of cbs) {
            if (f instanceof Function) doneAnim.then(f)
          }  
        })

        doneAnim.then(() => this.enabled.set(true))
        

        return ret
      }
    }


    

    
  }

  private loadingCircle = ce("loading-circle").addClass("buttonAccent")
  private checkIcon = new CheckIcon().addClass("buttonAccent")

  private moveText() {
    return this.mySlotElem.anim({
      translateX: -8
    })
  }

  private moveTextBack() {
    return this.mySlotElem.anim({
      translateX: .1
    })
  }

  private async startLoading() {
    this.moveBody.apd(this.loadingCircle)
    this.addClass("loading")

    await Promise.all([
      this.loadingCircle.anim({
        opacity: 1,
        marginRight: 0
      }),
      this.moveText()
    ])
    
    await delay(250)
  }
  private async stopLoading(started: boolean) {
    this.removeClass("loading")
    if (started) {
      await Promise.all([
        this.loadingCircle.anim({
          opacity: 0,
          marginRight: -5
        }),
        this.moveTextBack()
      ])
  
      this.loadingCircle.remove()
    }
    
  }
  private async succLoading(started: boolean) {
    this.removeClass("loading")

    this.moveBody.apd(this.checkIcon)

    if (started) {
      await Promise.all([
        this.loadingCircle.anim({
          opacity: 0,
          marginRight: 5
        }),
        delay(100).then(() => this.checkIcon.anim({
          opacity: 1,
          marginRight: 0
        }))
      ])
      this.loadingCircle.remove()
      
    }
    else {
      await Promise.all([
        this.checkIcon.anim({
          opacity: 1,
          marginRight: 0
        }),
        this.moveText()
      ])
    }

    await delay(700)

    
    Promise.all([
      this.checkIcon.anim({
        opacity: 0,
        marginRight: -5
      }, 400),
      this.moveTextBack()
    ]).then(() => {
      this.checkIcon.remove()
    })







  }
  private async errorLoading(started: boolean) {
    this.removeClass("loading")
    if (started) {
      await Promise.all([
        this.loadingCircle.anim({
          opacity: 0,
          marginRight: -5
        }),
        this.moveTextBack()
      ])
      this.loadingCircle.remove()
    }
  }


  private showLoadingAnimationFor(time: Promise<any[]>) {
    return new Promise<boolean>((res, rej) => {

      const endProm = (res: (started: boolean) => void) => () => {
        if (readyToFadout) {
          readyToFadout.then(() => {
            res(true)
          })
        }
        else {
          clearTimeout(t)
          res(false)
        }
      }
      
      time.then(endProm(res)).catch(endProm(rej))
  
      let readyToFadout: Promise<void>
      const t = setTimeout(() => {
        readyToFadout = this.startLoading()
      }, 50)
    })
    
  }

  
  stl() {
    return super.stl() + require("./loadButton.css").toString();
  }
  pug() {
    return super.pug()
  }
}

declareComponent("load-button", LoadButton)