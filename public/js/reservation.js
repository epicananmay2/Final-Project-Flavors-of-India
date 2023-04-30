/**
* Name: Anupama Hazarika, Ananmay Rajan, Jenan Meri
* Course: Csc 337
* Purpose: This program makes it possible so that when the user wants
* to make a reservation they can and they can view past and current 
* reservations as well.
*/

const errorEl = document.getElementById("error");
const successEl = document.getElementById("success");
const formEl = document.getElementById("reservationForm");

/**
* This function displays
* the date for the 
* reservation.
*
* Parameters: dateObj.
* Returns: Date.
*/
function getDate(dateObj) {
  if (dateObj) {
    return `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
  }
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
* This function
* handles form submission.
*
* Parameters: event.
* Returns: Messages.
*/
async function makeReservation(event) {
  event.preventDefault();
  errorEl.style.display = "none";
  successEl.style.display = "none";

  const time = document.getElementById("time").value;
  const noOfPersons = document.getElementById("noOfPersons").value;
  const phone = document.getElementById("phone").value;
  const date = document.getElementById("date").value;

  const now = new Date();
  const dateObj = new Date(date);
  const hours = parseInt(time.split(":")[0]);
  console.log(time, hours);

  if (dateObj < now) {
    errorEl.textContent = "Invalid Date. Select a date in the future";
    errorEl.style.display = "block";
    return;
  }

  if (hours < 11 || hours > 22) {
    errorEl.textContent = "Time should be between 11am and 11pm";
    errorEl.style.display = "block";
    return;
  }

  if (isNaN(phone) || phone.length !== 10) {
    errorEl.textContent = "Invalid Phone number";
    errorEl.style.display = "block";
    return;
  }

  // Send reservation data to server
  try {
    const response = await fetch("/api/reservation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ time, noOfPersons, phone, date }),
    });
    const data = await response.json();
    if (data.ok) {
      // alert("Reservation made successfully!");
      successEl.textContent = "Your Reservation is completed";
      successEl.style.display = "block";
      formEl.reset();
      setTimeout(() => (successEl.style.display = "none"), 10000);
      viewReservations();
    } else {
      errorEl.textContent = data.message;
      errorEl.style.display = "block";
    }
  } catch (e) {
    errorEl.textContent = e;
    errorEl.style.display = "block";
  }
}

/**
* This function
* allows the user
* to view all their 
* reservations
*
* Parameters: None.
* Returns: None.
*/
async function viewReservations() {
  reservationsContainer.innerHTML = "";
  try {
    const response = await fetch("/api/reservations");
    const data = await response.json();
    if (!data.ok) {
      alert(data.message);
    } else {
      // Get the reservations container element
      const reservationsContainer = document.getElementById(
        "reservationsContainer"
      );

      // Clear any existing reservations
      reservationsContainer.innerHTML = "";

      if (data.reservations.length === 0) {
        reservationsContainer.innerHTML = `<p> You haven't made any Reservations yet. </p>`;
        return;
      }

      // Loop through each reservation and create a reservation element
      data.reservations.forEach((reservation) => {
        const date = reservation.date.split("T")[0];
        const dateObj = new Date(date);
        const now = new Date();
        const dateObjDate = getDate(dateObj);
        const nowDate = getDate();
        const dateClass =
          dateObjDate === nowDate
            ? "today"
            : dateObj > now
              ? "upcoming"
              : "done";

        // Create a reservation element
        const reservationElement = document.createElement("div");
        reservationElement.className = `reservation ${dateClass}`;

        // Display reservation information in the element
        reservationElement.innerHTML = `
        <div>
          <p><span>Time:</span> ${reservation.time}</p>
          <p><span>Party Size:</span> ${reservation.noOfPersons}</p>
        </div>
        <div>
          <p><span>Date:</span> ${date}</p>
          <p><span>Phone:</span> ${reservation.phone}</p>
        <div>
      `;

        // Append the reservation element to the reservations container
        reservationsContainer.appendChild(reservationElement);
      });
    }
  } catch (e) {
    alert("Something went wrong!.");
  }
}

formEl.addEventListener("submit", makeReservation);
viewReservations();
