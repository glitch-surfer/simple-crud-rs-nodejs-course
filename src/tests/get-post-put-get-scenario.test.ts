import {describe, it, after} from 'node:test';
import {deepStrictEqual, strictEqual} from 'node:assert';

const url = 'http://localhost:3000/api/users';

describe('Should get empty initial users list, add some user, update this user and get user again with updated data', () => {
    const updatedUser = {username: 'test', age: 31, hobbies: ['birdwatching', 'hiking']};
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

    it('Should update user', async () => {
        const response = await fetch(`${url}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser),
        });
        const data: any = await response.json();
        deepStrictEqual(data, {data: {id: userId, ...updatedUser}, error: null});
    })

    it('Should get updated user', async () => {
        const response = await fetch(`${url}/${userId}`);
        const data = await response.json();
        deepStrictEqual(data, {data: {id: userId, ...updatedUser}, error: null});
    })

    after(async () => {
        const response = await fetch(`${url}/${userId}`, {
            method: 'DELETE',
        });
        strictEqual(response.status, 204);
    })
})
