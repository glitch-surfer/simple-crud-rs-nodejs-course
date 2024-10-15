import { parseRequestBody } from "../../../helpers/parse-request-body.js";
import { User } from "../../../models/user.js";
import { handleErrorResponse } from "../../../helpers/handle-error-response.js";
import { handleResponse } from "../../../helpers/handle-response.js";
import { IncomingMessage, ServerResponse } from "http";
import { UsersRepository } from "../../../users-repository";

export const createUserHandler = async (
  req: IncomingMessage,
  res: ServerResponse,
  usersRepository: UsersRepository,
) => {
  const body = await parseRequestBody<User>(req);

  if (!body?.username || !body.age) {
    handleErrorResponse(res, 400, "Username and age are required");
    return;
  }

  const { data } = await usersRepository.create(body);

  handleResponse(res, data, 201);
};
