import http from "http";

export const handleResponse = <T>(res: http.ServerResponse, data: T, code = 200) => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({data, error: null}));
}