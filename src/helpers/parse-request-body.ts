import http from "http";

export const parseRequestBody = <T>(req: http.IncomingMessage): Promise<T> => new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', () => {
        resolve(JSON.parse(body));
    });

    req.on('error', (error: Error) => {
        reject(error);
    });
});
