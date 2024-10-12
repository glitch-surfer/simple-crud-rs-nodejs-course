import http from "http";

export const handleErrorResponse = (res: http.ServerResponse, code = 500, message = 'Internal server error') => {
    res.statusCode = code;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({data: null, error: message}));
}