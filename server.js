const express = require('express');
const app = express();
const mysql = require('mysql');
const { cursorTo } = require('readline');
const { SSL_OP_NO_TICKET } = require('constants');


// const fs = require('fs');

var http = require('http').Server(app);
var io = require('socket.io')(http);


const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatapp"
});

app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/socket.html');
})



var clients = 0;
users = [];
curr_user = '';

io.on('connection', (socket) => {
    console.log('A user is connected');

    clients++;
    io.emit('newclientconnnect', {
        description: 'Welcome New Client',
        user: curr_user    
    }
        );

    socket.on('user', (data) => {
        users.push(data);
        curr_user = data;

        let user = {
            username: data
        }


        let sql = "INSERT INTO users SET ?";
        
        let query = conn.query(sql, user, (err, result) => {
            if (err) throw err;
            socket.broadcast.emit('userSet', user);

            
        })        
    });

    socket.on('newMsg', (data) => {

        let info = {
            userId: data.user,
            message: data.msg
        }


        let sql = "INSERT INTO msgs SET ?";
        let query = conn.query(sql, info, (err, result) => {
            if (err) throw err;            
            io.sockets.emit('appendMsg', info)
        })       
    })
    

    socket.broadcast.emit('newclientconnnect',{
        description: clients + ' Users connected'
    }
    );

    socket.on('disconnect', () => {
        clients--;
        io.sockets.emit('broadcast', {description: clients + ' Users connected'});

    });
});



const server = http.listen("8080", () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log("App Running on Port ", host, port)
})