/**
* Name: Anupama Hazarika
* Course: Csc 337
* Purpose: This program makes it possible for users to view the history of their orders
* made in this website.
*/

const ordersEl = document.getElementById("orders");

/**
* This function makes a request to the server to return all orders made by a user
* and then creates the html needed to display each order.
*
* Parameters: None.
* Returns: None.
*/
function getOrdersHistory() {
	fetch("/api/ordersHistory")
		.then((response) => response.json())
		.then((res) => {
			if (!res.ok) return alert(res.message);

			ordersEl.innerHTML = "";
			const orders = res.data;

			if (orders.length === 0) {
				ordersEl.innerHTML = `<p> You haven't made any order yet. </p>`;
				return;
			}

			orders.forEach((order) => {
				let itemsHtml = "";
				order.items.forEach((item) => {

					//set the html for each item in an order.
					itemsHtml += `
						<tr>
							<td>${item.name}</td>
							<td>${item.qty}</td>
							<td>${item.price}</td>
						</tr>
				`;
				});

				//set the overall html for an order.
				const orderHtml = `
					<div class="order-box">
						<div class="order-date">Order Date: ${order.date.split("T")[0]}</div>
						<table>
							<thead>
								<tr>
									<th>Item Name</th>
									<th>Quantity</th>
									<th>Price</th>
								</tr>
							</thead>
							<tbody>
							${itemsHtml}
							</tbody>
						</table>
						<div class="order-total">Total Price: $${order.total}</div>
					</div>
					`;

				ordersEl.innerHTML += orderHtml;
			});
		})
		.catch((error) => alert(error));
}

getOrdersHistory();
