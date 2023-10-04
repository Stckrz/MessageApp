//fetches the template hmtl file
const response = await fetch("./userlist-template.html");

//this makes the text version of the response, once it is fetched
const text = await response.text();

//This is turning the text into html
const html = new DOMParser().parseFromString(text, 'text/html');

//here, we are selecting the template
const template = html.querySelector('template');
export class UserList extends HTMLElement {
    constructor(userName) {
        super();
        this.userName = userName;
        this.attachShadow({ mode: 'open' });
        //returns a promise..
        this.templateFetched = this.addListUser();
        this.shadowRoot.appendChild(template.content.cloneNode(true));

    }


    addListUser() {

        //This selects the list item within the template, and then sets the textContent to the username passed in
        const a = template.content.querySelector(".user-list-item");
        a.textContent = this.userName;
                      
        //appends the template content to the shadowRoot
        
    }

    //asynchronous function that takes a function, waits unttil the template is fetched, and then creates the button.
    //Selects the button, and passes the handler passed in from main.js as an on-click event.
    addDmButtonClickHandler(handler){
        const dmButton = this.shadowRoot.querySelector(".dm-user")
        dmButton.addEventListener('click', handler)

    }
        
}
customElements.define('userlist-module', UserList);