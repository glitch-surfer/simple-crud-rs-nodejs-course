import { handleResponse } from "../../../helpers/handle-response.js";
import { ServerResponse } from "http";
import process from "node:process";
import { WorkerActionTypes } from "../../../models/worker-action-types.js";

export const getUsersHandler = (res: ServerResponse) => {
  return new Promise((resolve) => {
    process.once("message", ({ data }) => {
      handleResponse(res, data);
      resolve(data);
    });
    process.send?.({ type: WorkerActionTypes.GET_USERS });
  });
};
