import * as dotenv from "dotenv";

dotenv.config({ path: `${__dirname}/../.env` });

export const TOKEN = process.env.TOKEN;
export const PREFIX = process.env.PREFIX;
export const TARGET = process.env.TARGET;
export const MONGOURL = process.env.MONGOURL;
export const MONGODB = process.env.MONGODB;
