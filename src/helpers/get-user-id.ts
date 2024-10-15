import {IncomingMessage} from "http";

export const getUserId = (req: IncomingMessage) => req.url?.split('/')[3];