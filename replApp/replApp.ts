import edom from "extended-dom"



document.addEventListener('DOMContentLoaded', () => {
  document.body.innerHTML = ""
  edom()

  require("./init")
})


