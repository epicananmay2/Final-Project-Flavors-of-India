/**
* Name: Anupama Hazarika, Ananmay Rajan, Jenan Meri
* Course: Csc 337
* Purpose: This program makes it possible so that the user
* can enter in their payment information and be able to 
* order pickup or delivery.
*/

const pickupRadio = document.getElementById("pickup");
const deliveryRadio = document.getElementById("delivery");
const addressEl = document.getElementById("delivery-address");
const addressGroupEl = document.getElementById("address");
const orderSummaryEl = document.getElementById("orderSummary");
const paymentForm = document.getElementById("paymentForm");
const errorEl = document.getElementById("error");
const cvvEl = document.getElementById("cvv");
const creditCardNoEl = document.getElementById("creditCardNo");
const expDateEl = document.getElementById("expDate");
const paymentSuccessEl = document.getElementById("paymentSuccess");

const creditCardRegEx = new RegExp(/^[0-9]{4}\s[0-9]{4}\s[0-9]{4}\s[0-9]{4}$/);
const cvvRegEx = new RegExp("^[0-9]{3}$");
const expDateRegEx = new RegExp("^[0-9]{2}/[0-9]{2}$");

let type;

/**
* This function 
* allows the user
* to order delivery
*
* Parameters: e.
* Returns: None.
*/
function selectPickupOrDelivery(e) {
  type = e.target.id;
  console.log(type);

  if (type === "delivery") {
    addressEl.disabled = false;
    addressGroupEl.style.display = "block";
  } else {
    addressEl.disabled = true;
    addressGroupEl.style.display = "none";
  }
}

/**
* This function sends
* an error if something
* goes wrong
*
* Parameters: message.
* Returns: None.
*/
function setFormError(message) {
  errorEl.style.display = "block";
  errorEl.textContent = message;
}

/**
* This function resets
* the message for the
* next user.
*
* Parameters: None.
* Returns: None.
*/
function resetMessage() {
  errorEl.style.display = "none";
  errorEl.textContent = "";
}

function renderPaymentSuccess() { }

/**
* This function gets
* the order of the user
* logs in and only proccesses 
* it once the user has paid.
*
* Parameters: None.
* Returns: None.
*/
async function getCurrentOrder() {
  try {
    const req = await fetch("/api/currentOrder");
    const res = await req.json();
    if (res.ok) {
      console.log(res.data);
      const data = res.data;
      let orderSummaryHtml = "";

      data.items.forEach((item) => {
        const itemHtml = `
          <div class="item">
            <div>
              <p class="item-name">${item.name}<p>
              <p class="item-qty">x ${item.qty}<p>
            </div>
            <p class="item-price">
              $${item.price * item.qty}
            </p>
          </div>`;
        orderSummaryHtml += itemHtml;
      });

      orderSummaryHtml += `
      <div class="total-container">
        <p class="total-title">Total <span> </span></p>
        <p class="total-no">$${data.total}</p>
      </div>
      `;
      orderSummaryEl.innerHTML = orderSummaryHtml;
    } else {
      alert(res.message);
    }
  } catch (e) {
    console.log(e);
    alert("Something went wrong");
  }
}

/**
* This function sends
* all payment information
* to the server.
*
* Parameters: e.
* Returns: None.
*/
async function sendPaymentInfo(e) {
  e.preventDefault();
  resetMessage();

  const creditCardNo = creditCardNoEl.value;
  const cvv = cvvEl.value;
  const expDate = expDateEl.value;
  const address = addressEl.value;
  const data = { creditCardNo, cvv, expDate, type };

  if (!creditCardRegEx.test(creditCardNo)) {
    return setFormError(
      "Credit Card Number should be in a format of xxxx xxxx xxxx xxxx"
    );
  }

  if (!cvvRegEx.test(cvv)) {
    return setFormError("CVV should be in a format of xxx");
  }

  if (!expDateRegEx.test(expDate)) {
    return setFormError("expiry date should be in the format of xx/xx");
  }

  if (type === "delivery" && address.length < 3) {
    return setFormError("Invalid Address");
  }

  if (type === "delivery") {
    data.address = address;
  }

  console.log(data);

  try {
    const req = await fetch("/api/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const res = await req.json();
    console.log(res);

    if (res.ok) {
      paymentForm.remove();
      paymentSuccessEl.querySelector("p").textContent = res.message;
      paymentSuccessEl.style.display = "block";
    } else {
      setFormError(res.message || "Something went wrong!");
    }
  } catch (e) {
    setFormError("Something went wrong!");
    console.log(e);
  }
}

pickupRadio.addEventListener("click", selectPickupOrDelivery);
deliveryRadio.addEventListener("click", selectPickupOrDelivery);
paymentForm.addEventListener("submit", sendPaymentInfo);

getCurrentOrder();
