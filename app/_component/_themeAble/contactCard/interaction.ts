import ContactCard from "./contactCard"; // just as type
import _confetti from "canvas-confetti"
import blurEverythingInBackground from "./../../../lib/blurBackground"

export default function(this: ContactCard) {
  const confetti = _confetti.create(this.body.canvas, { resize: true });

  this.body.btn.click(() => {
    const { done, canOpen } = blurEverythingInBackground(this.body.btn)
    if (!canOpen) return
    
    console.log(this.body.btn.offsetLeft)

    const width = 800
    const height = 450

    this.css({
      height: this.css("height"),
      width: this.css("width"),
    })

    const ogButtonHeight = this.body.btn.css("height")
    this.body.btn.css("height", ogButtonHeight)
    const ogButtonWidth = this.body.btn.css("width")
    this.body.btn.css("width", ogButtonWidth)

    this.body.btn.css("cursor", "default")


    this.body.btn.anim({
      width,
      height,
      marginLeft: document.body.clientWidth/2 - width/2 - this.body.btn.getBoundingClientRect().left,
      marginTop: document.body.clientHeight/2 - height/2 - this.body.btn.getBoundingClientRect().top,
    })

    const descHeight = this.body.desc.height()
    this.body.desc.css("height", descHeight)
    console.log(descHeight)

    this.body.desc.css("width", this.body.desc.css("width"))

    this.body.desc.anim({
      left: "47%",
      height: 0,
      translateY: -386,
      scale: 1.2
    })


    this.body.pic.anim({
      translateX: -30
    })

    this.body.background.anim({
      translateX: 30
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
      await Promise.all([
        this.body.btn.anim({
          width: ogButtonWidth,
          height: ogButtonHeight,
          marginLeft: 0,
          marginTop: 0
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