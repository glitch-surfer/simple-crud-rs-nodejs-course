import { handleErrorResponse } from "../../../helpers/handle-error-response.js";
import { parseRequestBody } from "../../../helpers/parse-request-body.js";
import { User } from "../../../models/user.js";
import { handleResponse } from "../../../helpers/handle-response.js";
import { IncomingMessage, ServerResponse } from "http";
import process from "node:process";
import { WorkerActionTypes } from "../../../models/worker-action-types.js";
import { getUserId } from "../../../helpers/get-user-id.js";

export const updateUserHandler = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  return new Promise(async (resolve) => {
    const data = await parseRequestBody<User>(req);

    if (!data?.username || !data.age) {
      handleErrorResponse(res, 400, "Username and age are required");
      return;
    }

    process.once("message", ({ data, error }) => {
      if (error) return handleErrorResponse(res, 404, "User not found");
      handleResponse(res, data);
      resolve(data);
    });

    const id = getUserId(req);
    process.send?.({
      type: WorkerActionTypes.UPDATE_USER,
      data: { ...data, id },
    });
  });
};
