import ContactCard from "./contactCard"; // just as type
import _confetti from "canvas-confetti"
import blurEverythingInBackground from "./../../../lib/blurBackground"

export default function(this: ContactCard) {
  const confetti = _confetti.create(this.body.canvas, { resize: true });

  this.body.btn.click(() => {
    const blurRes = blurEverythingInBackground(this.body.btn)
    if (!blurRes.canOpen) return
    const { done } = blurRes
     
    console.log(this.body.btn.offsetLeft)

    

    this.css({
      height: this.css("height"),
      width: this.css("width"),
    })

    const ogButtonHeight = this.body.btn.css("height")
    this.body.btn.css("height", ogButtonHeight)
    const ogButtonWidth = this.body.btn.css("width")
    this.body.btn.css("width", ogButtonWidth)

    this.body.btn.css("cursor", "default")


    let wantedWidth = 800
    let wantedHeight = 450


    const descHeight = this.body.desc.height()
    this.body.desc.css("height", descHeight)
    this.body.desc.css("width", this.body.desc.css("width"))


    

    if (window.innerWidth > 750) {
      this.body.desc.anim({
        left: "55%",
        height: 0,
        translateY: -386,
        scale: 1.2
      })


      const imgOffset = 150

      this.body.pic.anim({
        translateX: -imgOffset
      })

      this.body.background.anim({
        translateX: imgOffset
      })
    }
    else {
      wantedWidth = Math.min(window.innerWidth - 50, 500)
      this.body.desc.anim({
        color: "white",
      })
      this.body.subSubTxt.css("--text", "255, 255, 255")
    }

    this.body.btn.preHoverAnimations.disable()

    

    const width = Math.min(window.innerWidth - 50, wantedWidth)
    const height = wantedHeight
    const bottom = -1 * (document.body.clientHeight/2 - height/2 - this.body.btn.getBoundingClientRect().top)
    const right = -1 * (document.body.clientWidth/2 - width/2 - this.body.btn.getBoundingClientRect().left)
    this.body.btn.anim({
      width,
      height,
      bottom,
      right
    })

    

    


    

    
    

    
    let confettiListener = this.body.btn.click((e) => {
      

      let x = 0.5
      if (e instanceof MouseEvent) {
        const bodyRect = this.body.canvas.getBoundingClientRect()
        const mouse = {
          x: e.clientX - bodyRect.left,
          y: e.clientY - bodyRect.top
        }

        x = mouse.x/bodyRect.width
      }

      var count = 300;
      var defaults = {
        origin: { y: 1.1, x }
      };

      function fire(particleRatio, opts) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    })

    done.then(() => {
      this.body.btn.removeActivationCallback(confettiListener)
    })
    

    



    done.then(async () => {
      this.body.btn.preHoverAnimations.enable()
      this.body.desc.anim({
        color: "inherit",
      })
      this.body.subSubTxt.css("--text", "inherit")


      await Promise.all([
        this.body.btn.anim({
          width: ogButtonWidth,
          height: ogButtonHeight,
          bottom: 0,
          right: 0
        }),
        this.body.desc.anim({
          left: 0,
          height: descHeight,
          translateY: 0,
          scale: 1
        }),
        this.body.pic.anim({
          translateX: 0
        }),
        this.body.background.anim({
          translateX: 0
        }),
      ])

      this.body.btn.css("cursor", "zoom-in")

      this.style.removeProperty("height")
      this.style.removeProperty("width")
      this.body.btn.style.removeProperty("height")
      this.body.btn.style.removeProperty("width")
      this.body.desc.style.removeProperty("width")
      this.body.desc.style.removeProperty("height")
    })

    
  })
}