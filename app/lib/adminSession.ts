import localSettings from "./localSettings"
import * as domain from "./domain"

export const cookieSettings = localSettings<string>("adminSession", "")
export default cookieSettings


cookieSettings.get(() => {
  if (domain.domainIndex.first === "admin") domain.set("admin", undefined, false, true)
}, false)
