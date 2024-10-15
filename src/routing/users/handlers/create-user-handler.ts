import { parseRequestBody } from "../../../helpers/parse-request-body.js";
import { User } from "../../../models/user.js";
import { handleErrorResponse } from "../../../helpers/handle-error-response.js";
import { handleResponse } from "../../../helpers/handle-response.js";
import { IncomingMessage, ServerResponse } from "http";
import process from "node:process";
import { WorkerActionTypes } from "../../../models/worker-action-types.js";

export const createUserHandler = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  return new Promise(async (resolve) => {
    const data = await parseRequestBody<User>(req);

    if (!data?.username || !data.age) {
      handleErrorResponse(res, 400, "Username and age are required");
      return;
    }

    process.once("message", ({ data }) => {
      handleResponse(res, data, 201);
      resolve(data);
    });
    process.send?.({ type: WorkerActionTypes.CREATE_USER, data });
  });
};
