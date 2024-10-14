import {handleErrorResponse} from "../../../helpers/handle-error-response.js";
import {parseRequestBody} from "../../../helpers/parse-request-body.js";
import {User} from "../../../models/user.js";
import {handleResponse} from "../../../helpers/handle-response.js";
import {IncomingMessage, ServerResponse} from "http";
import {UsersRepository} from "../../../users-repository.js";
import {getUserId} from "../../../helpers/get-user-id.js";

export const updateUserHandler = async (req: IncomingMessage, res: ServerResponse, usersRepository: UsersRepository) => {
    const id = getUserId(req);
    if (!id) return handleErrorResponse(res, 400, 'User id is required');
    if (!usersRepository.hasUser(id)) return handleErrorResponse(res, 404, 'User not found');

    const user = await parseRequestBody<User>(req);

    if (!user?.username || !user.age) {
        handleErrorResponse(res, 400, 'Username and age are required');
        return;
    }

    const updatedUser = usersRepository.update(id, user);

    handleResponse(res, updatedUser);
    return usersRepository.getData();
}