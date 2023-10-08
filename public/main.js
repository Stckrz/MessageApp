import { UserList } from "./templates/userlist-template.js";
import { MessageWrap } from "./templates/messagewrap-template.js";

function ChatlistAdd(user) {
    const newDm = document.createElement("div");
    newDm.classList.add("chat");
    newDm.classList.add(`${user}-chat`);
    newDm.textContent = `${user}`;
    const closeButton = document.createElement('button');
    closeButton.textContent = 'x'
    closeButton.classList.add("close-button");
    newDm.appendChild(closeButton);

    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        newDm.remove();
        openChats.splice(openChats.indexOf(user), 1);
    });

    return (newDm);
}


function emptyParentElement(parentClass) {
    while (parentClass.firstChild) {
        parentClass.firstChild.remove()
    }
}

const socket = io();

const main = document.querySelector('.main');
const wrapper = document.querySelector('.wrapper');
const startWrapper = document.querySelector('.startWrapper');
const usernameInput = document.querySelector('.username-input');
const usernameButton = document.querySelector('.username-button');
const userList = document.querySelector('.user-list');
const chatlist = document.querySelector('.chat-list');


let SelectedUser = "room";
let openChats = ["room"];
let blockedUsers = [];
let currentUser = "";
let roomElementList = [];


main.style.visibility = 'hidden';

usernameButton.addEventListener('click', (e) => {
    e.preventDefault();

    if (usernameInput.value) {
        const username = usernameInput.value;
        currentUser = username;
        socket.emit('username', username);
        socket.emit('update user list', username);
        startWrapper.style.visibility = 'hidden';
        main.style.visibility = 'visible';
        const mainroom = ChatlistAdd("room");
        chatlist.appendChild(mainroom);
        openChats.push(username);

        mainroom.addEventListener('click', () => {
            SelectedUser = 'room';
            console.log(`${SelectedUser} selected`)
            mainroom.classList.remove('show')

            socket.emit('select chat recipient', "room");
        });
    }
});

//when recieving the 'update chat log' emit from server, deletes all items from the chat log and recreates them, one for each
//item in msgs, which is an array of user: message pairs.
socket.on('update chat log', (msgs, sender) => {
    if (!openChats.includes(sender)) {
        openChats.push(sender);
        const newRoom = ChatlistAdd(sender)
        chatlist.appendChild(newRoom);
        roomElementList.push(newRoom);

        newRoom.addEventListener('click', () => {
            socket.emit('select chat recipient', sender);
            SelectedUser = sender;
            console.log(`${SelectedUser} selected`)

            newRoom.classList.remove("show")
        });
    }

    if (sender === SelectedUser) {
        emptyParentElement(wrapper);
        const messageWrap = new MessageWrap(msgs, SelectedUser, blockedUsers);
        wrapper.appendChild(messageWrap);
        messageWrap.onMessageSend((message) => {
            if (message) {
                socket.emit('chat message', message, SelectedUser);
            }
        })

        window.scrollTo(0, document.body.scrollHeight);
    } else {
        let a = document.querySelector(`.${sender}-chat`);
        a.classList.add("show")

    }
});

socket.on('block user', (blockedBy) => {
    blockedUsers.push(blockedBy);
    socket.emit('update user list');
})

//Renders the user list when 'update user list' is emitted from server, using the array that is passed.
socket.on('update user list', (userarr) => {
    let userArray = JSON.parse(userarr);
    emptyParentElement(userList);

    for (let i = 0; i < userArray.length; i++) {
        //instantiates a new UserList for each item in the userArray, appends it to the userListItem, and hooks up the 
        //buttonclickhandler to the button.
        if (userArray[i] != currentUser) {
            if (!blockedUsers.includes(userArray[i])) {
                const userListItem = new UserList(userArray[i])
                userList.appendChild(userListItem);

                userListItem.addBlockButtonClickHandler(() => {
                    blockedUsers.push(userArray[i]);
                    socket.emit('update user list');
                    socket.emit('block user', userArray[i])
                })

                userListItem.addDmButtonClickHandler(() => {
                    if (openChats.includes(userArray[i])) {
                        SelectedUser = userArray[i];
                        console.log(`${SelectedUser} selected`)
                        socket.emit('select chat recipient', userArray[i])
                    } else {

                        SelectedUser = userArray[i];
                        if (!openChats.includes(userArray[i])) {
                            openChats.push(userArray[i]);
                            const roomlist = ChatlistAdd(userArray[i]);
                            chatlist.appendChild(roomlist);
                            socket.emit('chat message', ``, userArray[i])
                            socket.emit('select chat recipient', userArray[i])
                            SelectedUser = userArray[i];
                            console.log(`${SelectedUser} selected`)

                            roomlist.addEventListener('click', () => {
                                SelectedUser = userArray[i];
                                console.log(`${SelectedUser} selected`)
                                socket.emit('select chat recipient', userArray[i])
                                roomlist.classList.remove("show")
                            });
                        }
                    }
                })
            }
        }
    }
})