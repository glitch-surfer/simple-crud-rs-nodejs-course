import http from 'http';
import {handleErrorResponse} from "./helpers/handle-error-response.js";
import {handleUsersRequest} from "./routing/users/index.js";

const PORT = process.env.PORT || 8000;

const server = http.createServer(async (req, res) => {
    try {
        if (!req.url?.startsWith('/api/users')) {
            handleErrorResponse(res, 404, 'Not found');
            return;
        }

        await handleUsersRequest(req, res);
    } catch (error) {
        console.error('Server error:', error);
        handleErrorResponse(res, 500, 'Internal server error');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
});
