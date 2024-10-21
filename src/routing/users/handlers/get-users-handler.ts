import { handleResponse } from "../../../helpers/handle-response.js";
import { ServerResponse } from "http";
import { UsersRepository } from "../../../users-repository.js";

export const getUsersHandler = async (
  res: ServerResponse,
  usersRepository: UsersRepository,
) => {
  const {data} = await usersRepository.getAll();
  handleResponse(res, data);
};
