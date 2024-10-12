import * as uuid from 'uuid';
import {User} from "./models/user";

const users: Record<string, User> = {};

export const userRepository = {
    create: ({username, age, hobbies = []}: User): User => {
        const newUser = {username, age, hobbies, id: uuid.v4()};
        users[newUser.id] = newUser;

        return newUser;
    },

    update: (id: string, {username, age, hobbies = []}: User): User => {
        users[id] = {id, username, age, hobbies};
        return users[id];
    },

    getOneById: (id: string): User | undefined => {
        return users[id];
    },

    getAll: (): User[] => {
        return Object.values(users);
    },

    delete: (id: string) => {
        delete users[id];
    },

    hasUser: (id: string): boolean => {
        return !!users[id];
    }
};
