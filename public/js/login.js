/**
* Name: Anupama Hazarika, Ananmay Rajan, Jenan Meri
* Course: Csc 337
* Purpose: This program makes it possible for users to create accounts and login
* for a certain while using those accounts.
*/

let type = "login";
const swapLoginSignupDiv = document.getElementById("login-signup-swap");
const swapLoginSignupText = document.getElementById("login-signup-swap-text");
const usernameFieldGroup = document.getElementById("username-field-group");
const termsFieldGroup = document.getElementById("terms-field-group");
const formBtn = document.getElementById("create-account-btn");
const form = document.getElementById("form");
const usernameField = document.getElementById("username");
const termsField = document.getElementById("terms");
const messageEl = document.getElementById("message");

/**
* This function displays the terms and conditions if the user clicks on the
* corresponding link.
*
* Parameters: None.
* Returns: None.
*/
function termsAndConditions() {
  var modal = document.getElementById("modal");
  var span = document.getElementsByClassName("close")[0];
  modal.style.display = "block";

  //stop displaying the terms and conditions if the user clicks on the 'x' button.
  span.onclick = function () {
    modal.style.display = "none";
  };
}

/**
* This function resets the messageEl.
*
* Parameters: None.
* Returns: None.
*/
function resetMessageEl() {
  messageEl.innerHTML = "";
  messageEl.style.display = "none";
}

/**
* This function makes a request to the server to let the user login and
* if the login is successful, it redirects to the menu page.
*
* Parameters: None.
* Returns: None.
*/
function login() {
  resetMessageEl();
  document.getElementById("message").innerHTML = "";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const user = {
    email: email,
    password: password,
  };

  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.ok) {
        window.location.href = "/menu"; //redirect.
      } else {
        messageEl.style.display = "block";
        messageEl.innerHTML = data.message; //display message if login unsuccessful
      }
    })
    .catch((error) => {
      document.getElementById("message").innerHTML =
        "An error occurred while login";
    });
}

/**
* This function makes a request to the server to add a user to the database.
*
* Parameters: None.
* Returns: None.
*/
function createAccount() {
  resetMessageEl();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value;

  const user = {
    username: username,
    password: password,
    email: email,
  };

  fetch("/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.ok) {
        window.location.href = "/menu"; //redirect.
      } else {
        messageEl.style.display = "block";
        messageEl.innerHTML = data.message; //display message if creation unsuccessful
      }
    })
    .catch((error) => {
      document.getElementById("message").innerHTML = error;
    });
}

/**
* This function allows the user to toggle between the login form or
* the account creation form.
*
* Parameters:
*	btn -- the button to click to toggle between the forms.
* Returns: None.
*/
function toggleLogin(btn) {
  resetMessageEl();
  type = type === "signup" ? "login" : "signup";

  if (type === "signup") {

    // login to signup

    usernameFieldGroup.style.display = "block";
    swapLoginSignupText.textContent = "Already have an Account";
    termsFieldGroup.style.display = "flex";
    usernameField.disabled = false;
    termsField.disabled = false;
    btn.textContent = "Login";
    formBtn.textContent = "Create Account";

  } else {

    // signup to login

    usernameFieldGroup.style.display = "none";
    swapLoginSignupText.textContent = "New here? Create an Account";
    termsFieldGroup.style.display = "none";
    usernameField.disabled = true;
    termsField.disabled = true;
    btn.textContent = "Here!";
    formBtn.textContent = "Login";

  }

  document.getElementById("message").innerHTML = "";
  document.getElementById("password").value = "";
  document.getElementById("email").value = "";
  document.getElementById("username").value = "";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (type === "signup") {
    createAccount();
  } else {
    login();
  }
});
