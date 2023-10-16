import { DataBase } from "josm"
import de from "../res/lang/de"
import en from "../res/lang/en"

type Lang = typeof en


export const lang = new DataBase<Lang>(en)
export default lang

