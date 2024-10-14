import http from 'http';
import {handleErrorResponse} from "./helpers/handle-error-response.js";
import {UsersRepository} from "./users-repository.js";
import dotenv from 'dotenv';
import cluster, {Worker} from "node:cluster";
import os from "node:os";
import process from "node:process";
import {handleUsersRequest} from "./routing/users/index.js";
import {User} from "./models/user";

dotenv.config();

const TYPE_UPDATE_USERS = 'UPDATE_USERS';

const PORT = process.env.PORT || 8000;

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    const numCPUs = os.availableParallelism();
    const workers: Worker[] = [];
    let currentWorker = 0;
    let users: Record<string, User> = {};

    for (let i = 1; i <= numCPUs; i++) {
        const worker = cluster.fork();
        workers.push(worker);
        worker.on('message', ({type, data}) => {
            if (type === TYPE_UPDATE_USERS) {
                users = data
                return
            }

            worker.send({port: +PORT + i})
        })
    }

    cluster.on('exit', (worker, code, signal) => console.log(`worker ${worker.process.pid} died`));

    http.createServer(async (clientReq, clientRes) => {
        const targetPort = currentWorker + 1 + +PORT;
        const workerReq = http.request({
            hostname: 'localhost',
            port: targetPort,
            path: clientReq.url,
            method: clientReq.method,
            headers: clientReq.headers
        }, workerRes => {
            clientRes.writeHead(workerRes.statusCode || 200, workerRes.headers);
            workerRes.pipe(clientRes);
        })
        workers[currentWorker].send?.({users})

        clientReq.pipe(workerReq);
        currentWorker = (currentWorker + 1) % numCPUs;
    })
        .listen(PORT)
        .on('error', (error) => console.error('Server error:', error));
} else {
    process.send?.({type: 'WORKER_STARTED', pid: process.pid})
    const usersRepository = new UsersRepository();
    let server: http.Server;

    process.on('message', ({port, users}) => {
        if (!server) {
            server = http.createServer(async (req, res) => {
                try {
                    if (!req.url?.startsWith('/api/users')) {
                        handleErrorResponse(res, 404, 'Not found');
                        return;
                    }

                    const data = await handleUsersRequest(req, res, usersRepository);
                    process.send?.({type: TYPE_UPDATE_USERS, data})
                } catch (error) {
                    console.error('Server error:', error);
                    handleErrorResponse(res, 500, 'Internal server error');
                }
            })
                .listen(port, () => console.log(`Server running on port ${port}`))
                .on('error', (error) => console.error('Server error:', error));
        }

        if (users) usersRepository.setData(users)
    });
}
