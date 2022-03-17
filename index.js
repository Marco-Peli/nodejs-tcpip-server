const express = require('express')
const util = require('util');
const fs = require('fs')
const readFile = util.promisify(fs.readFile);
const net = require('net');
console.log('Server starting..');
let fileFound = false;
const port = 3000
const timeout = 30000

const server = net.createServer();

server.on('connection', async function(socket) {

    console.log('------------remote client info --------------');

    const rport = socket.remotePort;
    const raddr = socket.remoteAddress;

    console.log('REMOTE Socket is listening at port ' + rport);
    console.log('REMOTE Socket ip : ' + raddr);

    socket.on('data', async function(data) {
        console.log('Remote data: ' + data)

        try {
            const filePath = 'files/test.txt'
            const file = await readFile(filePath)
            fileFound = true;
            console.log("Sending file " + filePath)
            socket.write(file)
        } catch (err) {
            socket.destroy();
        }
    });

    socket.on('error', function(error) {
        console.log('Error : ' + error);
    });

    socket.on('timeout', function() {
        console.log('Socket timed out, download failed');
        socket.destroy();
    });

    socket.on('end', async function(data) {
        console.log('Socket ended by connected board!');
    });

    socket.setTimeout(timeout, function() {
        socket.destroy();
        console.log('Socket forced timed out for maximum on-time elapsed');
    });

    socket.on('close', function(error) {
        console.log('Socket closed!');
        if (error) {
            console.log('Socket was closed for transmission error, download failed');
        }
    });

});

server.listen(port);

server.on('listening', function() {
    console.log('File download server listening at port ' + port);
});
