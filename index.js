const express = require('express');

//initializes app to be a function handler that you can supply to a http server
const app = express();
const http = require('http');
//does the thing
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public'))
app.use(express.static('public/templates'))

//when app recieves request, respond with html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


function FindChat(user1, user2) {
    //starts at 1 to disclude the "room" chatroom
    for (let i = 1; i < ChatRoom.AllChatrooms.length; i++) {
        if (ChatRoom.AllChatrooms[i].users[0].includes(user1 && user2)) {
            return ChatRoom.AllChatrooms[i]
        } else {
            console.log("fuck u");
        }
    }
}


class User {
    constructor(name, socketid) {
        this.name = name;
        this.socketid = socketid;
        User.AllUsers.push(this);
    }
    static FindUserBySocketId = (socketid) => {
        return User.AllUsers.find((user) => {
            return user.socketid === socketid;
        })
    }
    static FindSocketIdByUser = (username) => {
        return User.AllUsers.find((user) => {
            return user.name === username;
        })
    }
    static AllUsers = [];
}

class ChatRoom {
    constructor(users, messages) {
        this.users = [];
        this.messages = [];
        this.messages.push(messages);
        this.users.push(users)
        ChatRoom.AllChatrooms.push(this);
        ChatRoom.UsersArray.push(this.users)
    }
    sendMessage(message) {
        this.messages.push(message);
    }
    RoomChatLog() {
        return this.messages;
    }
    returnUsers() {
        return this.users;
    }
    static AllChatrooms = [];
    static UsersArray = [];
}




let namearray = [];
let mainChatRoom = new ChatRoom(['room', 'room'], "welcome");
//when connection is made, logs the connection. has build-in disconnect for when user disconnects like so:
io.on('connection', (socket) => {
    let userID = socket.id;

    socket.on('chat message', (msg, destination) => {

        const messageDestination = User.FindSocketIdByUser(destination)?.socketid ?? "room";
        const messageSender = User.FindUserBySocketId(userID).name;
        console.log(destination)

        if (messageDestination === 'room') {
            mainChatRoom.sendMessage(`${messageSender}: ${msg}`);
            io.emit('update chat log', mainChatRoom.RoomChatLog(), "room");

        } else {
            let chatCheck = FindChat(userID, User.FindSocketIdByUser(destination).socketid);
            if (!chatCheck) {
                let a = new ChatRoom([userID, User.FindSocketIdByUser(destination).socketid], msg)
                a.sendMessage(`${messageSender}: ${msg}`);
                console.log(a.RoomChatLog())
                socket.broadcast.to(messageDestination).emit('update chat log', a.RoomChatLog(), messageSender);
                // socket.emit('update chat log', a.RoomChatLog(), destination)

            } else {
                let a = chatCheck;
                console.log(a);
                a.sendMessage(`${messageSender}: ${msg}`)
                io.to(messageDestination).emit('update chat log', (a.RoomChatLog()), messageSender);
                socket.emit('update chat log', a.RoomChatLog(), destination)
            }

        }
    });


    socket.on('select chat recipient', (recipient) => {
        console.log(`you selected ${recipient}`)
        if (recipient === "room") {
            socket.emit('update chat log', mainChatRoom.RoomChatLog(), "room");
        } else {
            let privateChat = FindChat(userID, User.FindSocketIdByUser(recipient).socketid)
            socket.emit('update chat log', privateChat.RoomChatLog(), recipient);
        }
    })


    socket.on('username', (username) => {
        const newUser = new User(username, socket.id);
        mainChatRoom.sendMessage(`${newUser.name} has endered the chat`);
        io.emit('update chat log', mainChatRoom.RoomChatLog(), "room");

    });

    socket.on('update user list', (username) => {
        namearray.push(username);
        io.emit('update user list', JSON.stringify(namearray))
    });

});

io.on("connection", (socket) => {
    socket.on('disconnect', () => {
        const userwholeft = User.FindUserBySocketId(socket.id);
        const index = namearray.indexOf(userwholeft);
        namearray.splice(index, 1);
        io.emit('update user list', JSON.stringify(namearray));
    });
});

//making the server listen on port 3000
server.listen(3000, () => {
    console.log('listening on *:3000');
});



