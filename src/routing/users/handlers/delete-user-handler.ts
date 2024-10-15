import { handleErrorResponse } from "../../../helpers/handle-error-response.js";
import { handleResponse } from "../../../helpers/handle-response.js";
import { IncomingMessage, ServerResponse } from "http";
import { getUserId } from "../../../helpers/get-user-id.js";
import { UsersRepository } from "../../../users-repository.js";

export const deleteUserHandler = async (
  req: IncomingMessage,
  res: ServerResponse,
  usersRepository: UsersRepository,
) => {
  const id = getUserId(req);
  if (!id) return handleErrorResponse(res, 400, "User id is required");

  const { error } = await usersRepository.delete(id);
  if (error) return handleErrorResponse(res, 404, "User not found");

  handleResponse(res, { success: true }, 204);
};
