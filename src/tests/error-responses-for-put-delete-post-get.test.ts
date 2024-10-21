import {describe, it} from 'node:test';
import {deepStrictEqual, strictEqual} from 'node:assert';

const url = 'http://localhost:3000/api/users';

describe('Should return errors for put || delete if users doesnt exist, than error for incorrect post body, that empty users list', () => {
    const updatedUser = {username: 'test', age: 31, hobbies: ['birdwatching', 'hiking']};
    const invalidUser = {age: 30, hobbies: ['birdwatching']};
    const fakeUserId = '123';

    it('Should return error if try to update user that doesnt exist', async () => {
        const response = await fetch(`${url}/${fakeUserId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser),
        });
        strictEqual(response.status, 404);
        const data = await response.json();
        deepStrictEqual(data, {data: null, error: 'User not found'});
    })

    it('Should return error if try to delete user that doesnt exist', async () => {
        const response = await fetch(`${url}/${fakeUserId}`, {
            method: 'DELETE',
        });
        strictEqual(response.status, 404);
        const data = await response.json();
        deepStrictEqual(data, {data: null, error: 'User not found'});
    })

    it('Should return error if try to create user with invalid body', async () => {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invalidUser),
        });
        strictEqual(response.status, 400);
        const data: any = await response.json();
        deepStrictEqual(data, {data: null, error: 'Username and age are required'});
    })

    it('Should return error if try to get user that doesnt exist', async () => {
        const response = await fetch(`${url}/${fakeUserId}`);
        strictEqual(response.status, 404);
        const data = await response.json();
        deepStrictEqual(data, {data: null, error: 'User not found'});
    })
})
