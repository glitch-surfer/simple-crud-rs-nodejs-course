import { handleErrorResponse } from "../../../helpers/handle-error-response.js";
import { parseRequestBody } from "../../../helpers/parse-request-body.js";
import { User } from "../../../models/user.js";
import { handleResponse } from "../../../helpers/handle-response.js";
import { IncomingMessage, ServerResponse } from "http";
import { getUserId } from "../../../helpers/get-user-id.js";
import { UsersRepository } from "../../../users-repository.js";

export const updateUserHandler = async (
  req: IncomingMessage,
  res: ServerResponse,
  usersRepository: UsersRepository,
) => {
  const body = await parseRequestBody<User>(req);

  if (!body?.username || !body.age) {
    handleErrorResponse(res, 400, "Username and age are required");
    return;
  }
  const id = getUserId(req);
  if (!id) return handleErrorResponse(res, 400, "User id is required");

  const { error, data } = await usersRepository.update({ ...body, id });
  if (error) return handleErrorResponse(res, 404, "User not found");

  handleResponse(res, data);
};
