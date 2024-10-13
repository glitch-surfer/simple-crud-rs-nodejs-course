import {spawn} from 'child_process';
import http from 'http';

// Start the server
const server = spawn('node', ['dist/index.js']);

server.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
});

server.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
});

// Function to check if server is running
function checkServer(retries = 30) {
    http.get('http://localhost:3000/api/users', (res) => {
        if (res.statusCode === 200) {
            console.log('Server is up. Running tests...');
            runTests();
        } else {
            retryServerCheck(retries - 1);
        }
    }).on('error', (err) => {
        retryServerCheck(retries - 1);
    });
}

function retryServerCheck(retries: number) {
    if (retries > 0) {
        setTimeout(() => checkServer(retries), 1000);
    } else {
        console.error('Server did not start in time');
        process.exit(1);
    }
}

function runTests() {
    const tests = spawn('node', ['--test', 'dist/**/*.test.js']);

    tests.stdout.on('data', (data) => {
        console.log(`Tests: ${data}`);
    });

    tests.stderr.on('data', (data) => {
        console.error(`Tests Error: ${data}`);
    });

    tests.on('close', (code) => {
        console.log(`Tests finished with code ${code}`);
        server.kill();
        process.exit(code);
    });
}

// Start checking if server is up
setTimeout(checkServer, 1000);