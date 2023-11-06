import process from "process";

export const IS_PROD = process.env.NODE_ENV === "production";
export const BASE_URL = IS_PROD ? "TBD" : "http://localhost:8080/";