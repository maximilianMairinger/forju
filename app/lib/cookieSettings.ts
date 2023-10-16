import localSettings from "./localSettings"

export const cookieSettings = localSettings<boolean>("allowCookies", null)
export default cookieSettings
