import { josmLocalStorageReflection } from "josm-adapter"

export const createLocalSetting = josmLocalStorageReflection
export default createLocalSetting



export const cookieSettings = createLocalSetting<boolean>("allowCookies", null)




