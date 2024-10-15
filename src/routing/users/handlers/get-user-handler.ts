import { IncomingMessage, ServerResponse } from "http";
import { handleErrorResponse } from "../../../helpers/handle-error-response.js";
import { handleResponse } from "../../../helpers/handle-response.js";
import { getUserId } from "../../../helpers/get-user-id.js";
import process from "node:process";
import { WorkerActionTypes } from "../../../models/worker-action-types.js";

export const getUserHandler = (req: IncomingMessage, res: ServerResponse) => {
  return new Promise((resolve) => {
    const id = getUserId(req);

    if (!id) return handleErrorResponse(res, 400, "User id is required");

    process.once("message", ({ data, error }) => {
      if (error) return handleErrorResponse(res, 404, "User not found");

      handleResponse(res, data);
      resolve(data);
    });
    process.send?.({ type: WorkerActionTypes.GET_USER, data: id });
  });
};
