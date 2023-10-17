import { DataBase } from "josm"
import de from "../res/lang/de"
import en from "../res/lang/en"

type Lang = typeof de


export const lang = new DataBase<Lang>(de)
export default lang

