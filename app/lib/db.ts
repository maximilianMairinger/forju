import { Data, DataBase } from "josm"
import localSettings from "./localSettings"



export const store = new DataBase({

})
// export const store = localSettings("store", {

// })
export default store


export function doubleLink(initiallyCorrectData: Data<any>, otherData: Data<any>) {
  const otherDataSub = otherData.get((v) => {
    initiallyCorrectDataSub.setToData(v)
  }, false)
  const initiallyCorrectDataSub = initiallyCorrectData.get((v) => {
    otherDataSub.setToData(v)
  })
}
