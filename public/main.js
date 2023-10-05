import { UserList } from "./templates/userlist-template.js";
import { MessageWrap } from "./templates/messagewrap-template.js";
import { ChatList } from "./templates/chatlist-template.js";

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
let currentUser = ""


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
        const mainroom = new ChatList("room");
        chatlist.appendChild(mainroom);
        openChats.push(username);

        mainroom.chatSelectClickHandler(() => {
            SelectedUser = 'room';
            console.log(`${SelectedUser} selected`)

            socket.emit('select chat recipient', "room");

        });
    }
});




//when recieving the 'update chat log' emit from server, deletes all items from the chat log and recreates them, one for each
//item in msgs, which is an array of user: message pairs.
socket.on('update chat log', (msgs, sender) => {
console.log(sender);
    if (sender != 'room') {
        if (!openChats.includes(sender)) {
            openChats.push(sender);
            const newRoom = new ChatList(sender);
            chatlist.appendChild(newRoom);


            newRoom.chatSelectClickHandler(() => {
                socket.emit('select chat recipient', sender);
                SelectedUser = sender;
                console.log(`${SelectedUser} selected`)
            });
        }

    } else {
        emptyParentElement(wrapper);
        const messageWrap = new MessageWrap(msgs, SelectedUser);
        wrapper.appendChild(messageWrap);
        messageWrap.onMessageSend((message) => {
            if (message) {
                socket.emit('chat message', message, SelectedUser);

            }
        })
    }

    window.scrollTo(0, document.body.scrollHeight);
    // }
});



//Renders the user list when 'update user list' is emitted from server, using the array that is passed.
socket.on('update user list', (userarr) => {
    let userArray = JSON.parse(userarr);
    emptyParentElement(userList);

    for (let i = 0; i < userArray.length; i++) {
        //instantiates a new UserList for each item in the userArray, appends it to the userListItem, and hooks up the 
        //buttonclickhandler to the button.
        if (userArray[i] != currentUser) {
            const userListItem = new UserList(userArray[i])
            userList.appendChild(userListItem);

            userListItem.addDmButtonClickHandler(() => {
                if (openChats.includes(userArray[i])) {
                    SelectedUser = userArray[i];
                    console.log(`${SelectedUser} selected`)
                    socket.emit('select chat recipient', userArray[i])
                } else {

                    SelectedUser = userArray[i];
                    if (!openChats.includes(userArray[i])) {
                        openChats.push(userArray[i]);
                        const roomlist = new ChatList(userArray[i]);
                        chatlist.appendChild(roomlist);
                        socket.emit('chat message', `new private message with ${userArray[i]}`, userArray[i])
                        socket.emit('select chat recipient', userArray[i])
                        SelectedUser = userArray[i];
                        console.log(`${SelectedUser} selected`)



                        roomlist.chatSelectClickHandler(() => {
                            // socket.emit('chat message', `new private message with ${userArray[i]}`, userArray[i])
                            SelectedUser = userArray[i];
                            console.log(`${SelectedUser} selected`)
                            socket.emit('select chat recipient', userArray[i])

                        });
                    }

                }
            })
        }
    }
})


