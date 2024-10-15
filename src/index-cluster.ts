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
  const usersRepository = UsersRepository.getInstance();
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
      worker.once("message", async ({ type, data: reqData }) => {
        switch (type) {
          case WorkerActionTypes.CREATE_USER: {
            const { data } = await usersRepository.create(reqData as User);
            worker.send?.({
              type: "USER_ADDED",
              data,
            });
            break;
          }
          case WorkerActionTypes.UPDATE_USER: {
            const { data, error } = await usersRepository.update(
              reqData as User,
            );
            worker.send?.({
              type: "USER_UPDATED",
              data,
              error,
            });
            break;
          }
          case WorkerActionTypes.DELETE_USER: {
            const { data, error } = await usersRepository.delete(
              reqData as string,
            );
            worker.send?.({
              type: "USER_DELETED",
              data,
              error,
            });
            break;
          }
          case WorkerActionTypes.GET_USER: {
            const { data, error } = await usersRepository.getOneById(
              reqData as string,
            );
            worker.send?.({
              type: "USER_RETRIEVED",
              data,
              error,
            });
            break;
          }
          case WorkerActionTypes.GET_USERS: {
            const { data } = await usersRepository.getAll();
            worker.send?.({
              type: "USERS_RETRIEVED",
              data,
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
