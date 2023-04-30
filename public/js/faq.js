/**
* Name: Anupama Hazarika, Ananmay Rajan, Jenan Meri
* Course: Csc 337
* Purpose: This program makes it possible so that when the user clicks on a
       certain question in the FAQ page, the corresponding answer is displayed
       under it.
*/

const questions = document.querySelectorAll(".question");

questions.forEach((question) => {
  question.addEventListener("click", () => {
    const answer = question.nextElementSibling;
    answer.style.display = answer.style.display === "block" ? "none" : "block";
  });
});
