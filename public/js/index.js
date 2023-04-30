/**
* Name: Anupama Hazarika, Ananmay Rajan, Jenan Meri
* Course: Csc 337
* Purpose: This program makes it possible so that when the user clicks on a
* the home page they can contact the restaurant about any questions.
*/

const contactUsButton = document.getElementById("contactUsButton");
const nameAbout = document.getElementById("nameAbout");
const nameAboutText = document.getElementById("nameAboutText");
const messageAbout = document.getElementById("messageAbout");
const messageAboutText = document.getElementById("messageAboutText");
const contactForm = document.getElementById("contactForm");
const successEl = document.getElementById("success");

/**
* This function sends
* the message if
* the user decides to contact us.
*
* Parameters: e.
* Returns: None.
*/
async function sendMessage(e) {
  e.preventDefault();
  const body = {
    name: nameAboutText.value,
    text: messageAboutText.value,
  };
  console.log("data", body);

  try {
    const res = await fetch("/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.ok) {
      successEl.style.display = "block";
      successEl.textContent = "Thank you for your message";
      contactForm.reset();
      setTimeout(() => (successEl.style.display = "none"), 5000);
    } else {
      alert("else Error: unable to send message");
    }
  } catch (e) {
    console.log(e);
    alert("Error: unable to send message");
  }
}

contactForm.addEventListener("submit", sendMessage);
