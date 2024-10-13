import {describe, it} from 'node:test';
import {deepStrictEqual, strictEqual} from 'node:assert';

const url = 'http://localhost:3000/api/users';

describe('Should get empty initial users list, add some user, delete this user and get users list again with empty list', () => {
    let userId: string;

    it('Should get empty initial users list', async () => {
        const response = await fetch(url);
        const data = await response.json();
        deepStrictEqual(data, {data: [], error: null});
    })

    it('Should add new user', async () => {
        const user = {username: 'test', age: 30, hobbies: ['birdwatching']};
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
        const data: any = await response.json();
        userId = data.data.id;
        deepStrictEqual(data, {data: {id: userId, ...user}, error: null});
    })

    it('Should delete user', async () => {
        const response = await fetch(`${url}/${userId}`, {
            method: 'DELETE',
        });

        strictEqual(response.status, 204);
    })

    it('Should return error that user not found', async () => {
        const response = await fetch(`${url}/${userId}`);

        strictEqual(response.status, 404);
    })
})
