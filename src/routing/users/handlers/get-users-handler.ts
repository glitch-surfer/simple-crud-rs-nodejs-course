import {handleResponse} from "../../../helpers/handle-response.js";
import {IncomingMessage, ServerResponse} from "http";
import {UsersRepository} from "../../../users-repository.js";

export const getUsersHandler = (req: IncomingMessage, res: ServerResponse, usersRepository: UsersRepository) => {
    handleResponse(res, usersRepository.getAll());
    return usersRepository.getData();
}