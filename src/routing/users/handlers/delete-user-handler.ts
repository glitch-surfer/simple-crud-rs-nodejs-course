import {handleErrorResponse} from "../../../helpers/handle-error-response.js";
import {handleResponse} from "../../../helpers/handle-response.js";
import {IncomingMessage, ServerResponse} from "http";
import {UsersRepository} from "../../../users-repository.js";
import {getUserId} from "../../../helpers/get-user-id.js";

export const deleteUserHandler = (req: IncomingMessage, res: ServerResponse, usersRepository: UsersRepository) => {
    const id = getUserId(req);
    if (!id) return handleErrorResponse(res, 400, 'User id is required');
    if (!usersRepository.hasUser(id)) return handleErrorResponse(res, 404, 'User not found');

    usersRepository.delete(id);
    handleResponse(res, {success: true}, 204);
    return usersRepository.getData();
}