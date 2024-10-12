import http from "http";
import {handleResponse} from "../../helpers/handle-response.js";
import {userRepository} from "../../users-repository.js";
import {handleErrorResponse} from "../../helpers/handle-error-response.js";
import {parseRequestBody} from "../../helpers/parse-request-body.js";
import {User} from "../../models/user.js";

const getUserId = (req: http.IncomingMessage) => req.url?.split('/').pop();

export const handleUsersRequest = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    switch (req.method) {
        case 'GET': {
            if (req.url === '/api/users') {
                handleResponse(res, userRepository.getAll());
                return;
            }

            const id = getUserId(req);

            if (!id) return handleErrorResponse(res, 400, 'User id is required');
            if (!userRepository.hasUser(id)) return handleErrorResponse(res, 404, 'User not found');

            handleResponse(res, userRepository.getOneById(id));
            return;
        }

        case 'POST': {
            const body = await parseRequestBody<User>(req);

            if (!body?.username || !body.age) {
                handleErrorResponse(res, 400, 'Username and age are required');
                return;
            }

            const user = userRepository.create(body);
            handleResponse(res, user, 201);
            return;
        }

        case 'DELETE': {
            const id = getUserId(req);
            if (!id) return handleErrorResponse(res, 400, 'User id is required');
            if (!userRepository.hasUser(id)) return handleErrorResponse(res, 404, 'User not found');

            userRepository.delete(id);
            handleResponse(res, {success: true}, 204);
            return;
        }

        case 'PUT': {
            const id = getUserId(req);
            if (!id) return handleErrorResponse(res, 400, 'User id is required');
            if (!userRepository.hasUser(id)) return handleErrorResponse(res, 404, 'User not found');

            const user = await parseRequestBody<User>(req);

            if (!user?.username || !user.age) {
                handleErrorResponse(res, 400, 'Username and age are required');
                return;
            }

            userRepository.update(id, user);

            handleResponse(res, user);
            return;
        }

        default: {
            handleErrorResponse(res, 405, 'Method not allowed')
        }
    }
}