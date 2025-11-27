const net = require('net');

const client = new net.Socket();

const PORT = 5433;
const HOST = 'localhost';

console.log(`Checking database connection at ${HOST}:${PORT}...`);

client.connect(PORT, HOST, function () {
    console.log('Database connection successful!');
    client.destroy();
    process.exit(0);
});

client.on('error', function (err) {
    console.error(`\n\x1b[31mError: Could not connect to the database at ${HOST}:${PORT}.\x1b[0m`);
    console.error(`\x1b[33mPlease ensure Docker is running and the database container is started.\x1b[0m`);
    console.error(`\x1b[33mRun 'docker-compose up -d' to start the database.\x1b[0m\n`);
    process.exit(1);
});

client.setTimeout(2000, function () {
    console.error(`\n\x1b[31mError: Database connection timed out at ${HOST}:${PORT}.\x1b[0m`);
    console.error(`\x1b[33mPlease ensure Docker is running and the database container is started.\x1b[0m`);
    console.error(`\x1b[33mRun 'docker-compose up -d' to start the database.\x1b[0m\n`);
    client.destroy();
    process.exit(1);
});
