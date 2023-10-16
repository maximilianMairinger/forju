import ajaon from "ajaon"
import edom from "extended-dom"


document.body.css("background", "black")

let { post, get } = ajaon();


(async () => {
  let res = await post("call")
  console.log(res)
})()
