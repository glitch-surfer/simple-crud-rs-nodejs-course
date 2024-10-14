import {spawn} from 'child_process';
import http from 'http';
import path from "node:path";
import fs from "node:fs";

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

async function runTests() {
    const testDir = path.join(process.cwd(), 'dist', 'tests');
    const testFiles = await fs.promises.readdir(testDir);
    const testJsFiles = testFiles.filter(file => file.endsWith('.test.js'));

    for (const testFile of testJsFiles) {
        console.log(`Running test file: ${testFile}`);
        const testProcess = spawn('node', ['--test', path.join(testDir, testFile)]);

        await new Promise<void>((resolve) => {
            testProcess.stdout.on('data', (data) => {
                console.log(`Test ${testFile}: ${data}`);
            });

            testProcess.stderr.on('data', (data) => {
                console.error(`Test ${testFile} Error: ${data}`);
            });

            testProcess.on('close', (code) => {
                console.log(`Test ${testFile} finished with code ${code}`);
                resolve();
            });
        });
    }

    server.kill();
    process.exit();
}

// Start checking if server is up
setTimeout(checkServer, 1000);