import colors from "colors";
import { log } from "./printer.js";

colors.enable();

export const errorMessage = (arg = "") => `${arg}`.brightRed;

export const successMessage = (arg = "") => `${arg}`.brightGreen;

export const warningMessage = (arg = "") => `${arg}`.brightYellow;

export const infoMessage = (arg = "") => `${arg}`.grey.bgWhite;

export const fyiMessage = (arg = "") => `${arg}`.brightWhite;
