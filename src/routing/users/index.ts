import {IncomingMessage, ServerResponse} from "http";
import {handleErrorResponse} from "../../helpers/handle-error-response.js";
import {User} from "../../models/user.js";
import {UsersRepository} from "../../users-repository.js";
import {getUsersHandler} from "./handlers/get-users-handler.js";
import {getUserHandler} from "./handlers/get-user-handler.js";
import {createUserHandler} from "./handlers/create-user-handler.js";
import {deleteUserHandler} from "./handlers/delete-user-handler.js";
import {updateUserHandler} from "./handlers/update-user-handler.js";

export const handleUsersRequest = async (req: IncomingMessage, res: ServerResponse, usersRepository: UsersRepository): Promise<Record<string, User> | void> => {
    if (req.url?.split('/')?.length! > 4) return handleErrorResponse(res, 404, 'Not found');

    switch (req.method) {
        case 'GET': {
            if (req.url === '/api/users') {
                return getUsersHandler(req, res, usersRepository);
            }
            return getUserHandler(req, res, usersRepository);
        }

        case 'POST': {
            return createUserHandler(req, res, usersRepository);
        }

        case 'DELETE': {
            return deleteUserHandler(req, res, usersRepository);
        }

        case 'PUT': {
            return updateUserHandler(req, res, usersRepository);
        }

        default: {
            handleErrorResponse(res, 405, 'Method not allowed')
        }
    }
}