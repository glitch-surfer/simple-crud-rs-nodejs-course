import http from 'http';
import {handleErrorResponse} from "./helpers/handle-error-response.js";
import {handleUsersRequest} from "./routing/users/index.js";
import dotenv from 'dotenv';
import {UsersRepository} from "./users-repository.js";

dotenv.config();
const PORT = process.env.PORT || 8000;
const usersRepository = new UsersRepository();

http.createServer(async (req, res) => {
    try {
        if (!req.url?.startsWith('/api/users')) {
            handleErrorResponse(res, 404, 'Not found');
            return;
        }

        await handleUsersRequest(req, res, usersRepository);
    } catch (error) {
        console.error('Server error:', error);
        handleErrorResponse(res, 500, 'Internal server error');
    }
})
    .listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    })
    .on('error', (error) => {
        console.error('Server error:', error);
    });
