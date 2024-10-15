import { handleErrorResponse } from "../../../helpers/handle-error-response.js";
import { handleResponse } from "../../../helpers/handle-response.js";
import { IncomingMessage, ServerResponse } from "http";
import { getUserId } from "../../../helpers/get-user-id.js";
import process from "node:process";
import { WorkerActionTypes } from "../../../models/worker-action-types.js";

export const deleteUserHandler = (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  return new Promise((resolve) => {
    const id = getUserId(req);

    if (!id) return handleErrorResponse(res, 400, "User id is required");

    process.once("message", ({ error }) => {
      if (error) return handleErrorResponse(res, 404, "User not found");

      handleResponse(res, { success: true }, 204);
      resolve({ success: true });
    });
    process.send?.({ type: WorkerActionTypes.DELETE_USER, data: id });
  });
};
