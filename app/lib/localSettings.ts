import { josmLocalStorageReflection } from "josm-adapter"

export const createLocalSetting = josmLocalStorageReflection
export default createLocalSetting



export const cookieAllowedSettings = /*#__PURE__*/createLocalSetting<string>("allowCookies", "unknown")


