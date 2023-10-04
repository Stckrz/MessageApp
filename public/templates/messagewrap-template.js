
const response = await fetch("./messagewrap-template.html");
const text = await response.text();
const html = new DOMParser().parseFromString(text, 'text/html');
const template = html.querySelector('template');

export class MessageWrap extends HTMLElement {
    constructor(messageArray, sendTo) {
        super();
        this.messageArray = messageArray;
        this.sendTo = sendTo;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.BuildChatWrapper();
    }

    BuildChatWrapper() {

        const messages = this.shadowRoot.querySelector(".messages");



        
        for (let i = 0; i < this.messageArray.length; i++) {
            const item = document.createElement('li');
            item.textContent = this.messageArray[i];
            messages.appendChild(item);

        }
    

    }

    onMessageSend(callback) {

        const msgbutton = this.shadowRoot.querySelector(".msg-button");
        const msginput = this.shadowRoot.querySelector(".msg-input");
        msgbutton.addEventListener('click', (e) => {
            e.preventDefault();
            callback(msginput.value)
            msginput.value = "";
            msginput.focus();
        })
    }
}
customElements.define('messagewrap-module', MessageWrap);