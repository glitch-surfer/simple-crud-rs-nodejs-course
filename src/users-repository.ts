import * as uuid from 'uuid';
import {User} from "./models/user.js";

export class UsersRepository {
    constructor(private users: Record<string, User> = {}) {
    }

    create({username, age, hobbies = []}: User): User {
        const newUser = {username, age, hobbies, id: uuid.v4()};
        this.users[newUser.id] = newUser;

        return newUser;
    };

    update(id: string, {username, age, hobbies = []}: User): User {
        this.users[id] = {id, username, age, hobbies};
        return this.users[id];
    }

    getOneById(id: string): User | undefined {
        return this.users[id];
    }

    getAll(): User[] {
        return Object.values(this.users);
    }

    delete(id: string) {
        delete this.users[id];
    }

    hasUser(id: string): boolean {
        return !!this.users[id];
    }

    getData(): Record<string, User> {
        return this.users;
    }

    setData(users: Record<string, User>) {
        this.users = users;
    }
}
