//  import { MessageWrap } from "/messagewrap-template";

// const response = await fetch("./chatlist-template.html");
// const text = await response.text();
// const html = new DOMParser().parseFromString(text, 'text/html');
// const template = html.querySelector('template');

// export class ChatList extends HTMLElement {
//     constructor(user) {
//         super();
//         this.user = user;
//         this.attachShadow({ mode: 'open' });
//         this.shadowRoot.appendChild(template.content.cloneNode(true));
//         this.BuildChatList();
//     }

//     BuildChatList(){
//         const newDm = document.createElement("div")
//         newDm.classList.add("chat");
//         const a = this.shadowRoot.querySelector(".chat");
//         a.classList.add(`${this.user}-chat`)
//         a.textContent = `${this.user}`

        
//     }

//     chatSelectClickHandler(handler){
//         const chatDivButton = this.shadowRoot.querySelector(".chat");
//         chatDivButton.addEventListener('click', handler)
//     }

// }
// customElements.define('chatlist-module', ChatList);




