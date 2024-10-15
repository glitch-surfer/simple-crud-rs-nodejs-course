import * as uuid from "uuid";
import { User } from "./models/user.js";
import cluster from "node:cluster";
import { WorkerActionTypes } from "./models/worker-action-types.js";

interface RepositoryResponse<T> {
  data: T;
  error?: boolean;
}

export class UsersRepository {
  private static instance: UsersRepository;
  private readonly isPrimaryProcess = cluster.isPrimary;
  private readonly users: Record<string, User> = {};

  private constructor() {}

  static getInstance() {
    if (!UsersRepository.instance) {
      UsersRepository.instance = new UsersRepository();
    }
    return UsersRepository.instance;
  }

  async create({
    username,
    age,
    hobbies = [],
  }: User): Promise<RepositoryResponse<User>> {
    const newUser = { username, age, hobbies, id: uuid.v4() };

    if (this.isPrimaryProcess) {
      this.users[newUser.id] = newUser;

      return { data: newUser };
    } else {
      return this.getDataFromPrimaryProcess(
        WorkerActionTypes.CREATE_USER,
        newUser,
      );
    }
  }

  async update({
    id,
    username,
    age,
    hobbies = [],
  }: User): Promise<RepositoryResponse<User | null>> {
    if (this.isPrimaryProcess) {
      if (!this.hasUser(id)) return { data: null, error: true };

      this.users[id] = { id, username, age, hobbies };
      return { data: this.users[id] };
    } else {
      return this.getDataFromPrimaryProcess(WorkerActionTypes.UPDATE_USER, {
        id,
        username,
        age,
        hobbies,
      });
    }
  }

  async getOneById(id: string): Promise<RepositoryResponse<User | null>> {
    if (this.isPrimaryProcess) {
      if (!this.hasUser(id)) return { data: null, error: true };

      return { data: this.users[id] };
    } else {
      return this.getDataFromPrimaryProcess(WorkerActionTypes.GET_USER, id);
    }
  }

  async getAll(): Promise<RepositoryResponse<User[]>> {
    if (this.isPrimaryProcess) {
      return { data: Object.values(this.users) };
    } else {
      return this.getDataFromPrimaryProcess(WorkerActionTypes.GET_USERS, null);
    }
  }

  async delete(id: string): Promise<RepositoryResponse<null>> {
    if (this.isPrimaryProcess) {
      if (!this.hasUser(id)) return { data: null, error: true };

      delete this.users[id];

      return { data: null };
    } else {
      return this.getDataFromPrimaryProcess(WorkerActionTypes.DELETE_USER, id);
    }
  }

  private hasUser(id: string): boolean {
    return !!this.users[id];
  }

  private getDataFromPrimaryProcess<T, D>(
    type: WorkerActionTypes,
    data: D,
  ): Promise<RepositoryResponse<T>> {
    return new Promise((resolve) => {
      process.once("message", (data) => {
        resolve(data as RepositoryResponse<T>);
      });
      process.send?.({
        type,
        data,
      });
    });
  }
}
