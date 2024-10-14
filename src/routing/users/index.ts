import http from "http";
import {handleResponse} from "../../helpers/handle-response.js";
import {handleErrorResponse} from "../../helpers/handle-error-response.js";
import {parseRequestBody} from "../../helpers/parse-request-body.js";
import {User} from "../../models/user.js";
import {UsersRepository} from "../../users-repository.js";

const getUserId = (req: http.IncomingMessage) => req.url?.split('/').pop();

export const handleUsersRequest = async (req: http.IncomingMessage, res: http.ServerResponse, usersRepository: UsersRepository): Promise<Record<string, User> | void> => {
    if (req.url?.split('/')?.length! > 4) return handleErrorResponse(res, 404, 'Not found');

    switch (req.method) {
        case 'GET': {
            if (req.url === '/api/users') {
                handleResponse(res, usersRepository.getAll());
                return usersRepository.getData();
            }

            const id = getUserId(req);

            if (!id) return handleErrorResponse(res, 400, 'User id is required');
            if (!usersRepository.hasUser(id)) return handleErrorResponse(res, 404, 'User not found');

            handleResponse(res, usersRepository.getOneById(id));
            return usersRepository.getData();
        }

        case 'POST': {
            const body = await parseRequestBody<User>(req);

            if (!body?.username || !body.age) {
                handleErrorResponse(res, 400, 'Username and age are required');
                return;
            }

            const user = usersRepository.create(body);
            handleResponse(res, user, 201);
            return usersRepository.getData();
        }

        case 'DELETE': {
            const id = getUserId(req);
            if (!id) return handleErrorResponse(res, 400, 'User id is required');
            if (!usersRepository.hasUser(id)) return handleErrorResponse(res, 404, 'User not found');

            usersRepository.delete(id);
            handleResponse(res, {success: true}, 204);
            return usersRepository.getData();
        }

        case 'PUT': {
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

        default: {
            handleErrorResponse(res, 405, 'Method not allowed')
        }
    }
}