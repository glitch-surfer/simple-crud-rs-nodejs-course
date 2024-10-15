import http from "http";
import { handleErrorResponse } from "./helpers/handle-error-response.js";
import { UsersRepository } from "./users-repository.js";
import dotenv from "dotenv";
import cluster, { Worker } from "node:cluster";
import os from "node:os";
import process from "node:process";
import { handleUsersRequest } from "./routing/users/index.js";
import { User } from "./models/user";
import { WorkerActionTypes } from "./models/worker-action-types.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  const numCPUs = os.availableParallelism();
  const usersRepository = new UsersRepository();
  const workers: Worker[] = [];
  let currentWorker = 0;

  for (let i = 1; i <= numCPUs; i++) {
    const worker = cluster.fork();
    workers.push(worker);
    worker.once("message", () => worker.send({ port: +PORT + i }));
  }

  cluster.on("exit", (worker) =>
    console.log(`worker ${worker.process.pid} died`),
  );

  http
    .createServer(async (clientReq, clientRes) => {
      const targetPort = currentWorker + 1 + +PORT;
      const workerReq = http.request(
        {
          hostname: "localhost",
          port: targetPort,
          path: clientReq.url,
          method: clientReq.method,
          headers: clientReq.headers,
        },
        (workerRes) => {
          clientRes.writeHead(workerRes.statusCode || 200, workerRes.headers);
          workerRes.pipe(clientRes);
        },
      );

      const worker = workers[currentWorker];
      worker.once("message", ({ type, data }) => {
        console.log('Primary process received message:', type, data);
        switch (type) {
          case WorkerActionTypes.CREATE_USER: {
            worker.send?.({
              type: "USER_ADDED",
              data: usersRepository.create(data as User),
            });
            break;
          }
          case WorkerActionTypes.UPDATE_USER: {
            const hasUser = usersRepository.hasUser(data.id);
            worker.send?.({
              type: "USER_UPDATED",
              data: hasUser && usersRepository.update(data as User),
              error: !hasUser,
            });
            break;
          }
          case WorkerActionTypes.DELETE_USER: {
            const hasUser = usersRepository.hasUser(data);
            worker.send?.({
              type: "USER_DELETED",
              data: hasUser && usersRepository.delete(data as string),
              error: !hasUser,
            });
            break;
          }
          case WorkerActionTypes.GET_USER: {
            const hasUser = usersRepository.hasUser(data as string);
            worker.send?.({
              type: "USER_RETRIEVED",
              data: hasUser && usersRepository.getOneById(data as string),
              error: !hasUser,
            });
            break;
          }
          case WorkerActionTypes.GET_USERS: {
            worker.send?.({
              type: "USERS_RETRIEVED",
              data: usersRepository.getAll(),
            });
            break;
          }
          default:
            console.error(`Unknown action type: ${type}`);
            break;
        }
      });

      clientReq.pipe(workerReq);
      currentWorker = (currentWorker + 1) % numCPUs;
    })
    .listen(PORT)
    .on("error", (error) => console.error("Server error:", error));
} else {
  process.send?.({ type: "WORKER_STARTED", pid: process.pid });
  let server: http.Server;

  process.on("message", ({ port }) => {
    if (!server) {
      server = http
        .createServer(async (req, res) => {
          try {
            if (!req.url?.startsWith("/api/users")) {
              handleErrorResponse(res, 404, "Not found");
              return;
            }

            await handleUsersRequest(req, res);
          } catch (error) {
            console.error("Server error:", error);
            handleErrorResponse(res, 500, "Internal server error");
          }
        })
        .listen(port, () => console.log(`Server running on port ${port}`))
        .on("error", (error) => console.error("Server error:", error));
    }
  });
}
