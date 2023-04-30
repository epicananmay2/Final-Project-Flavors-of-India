/**
* Name: Anupama Hazarika, Ananmay Rajan , Jenan Meri
* Course: Csc 337
* Purpose: The Server.js file is responsible for all the GET & POST requests made on specific pages, redirecting 
* users to the correct page, saving all the payment, reservations & user credientials info in the MongoDB Database & creating 
* an express server at local host port 5000. 
*/
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");

const { User, Item, Order, Reservation, ContactMessage } = require("./modals");

const PORT = 5000;
const DB_URL = "mongodb://127.0.0.1:27017/foi";

// functions return the current date in the format of yyyy-mm-dd
function getCurrentDate() {
  const d = new Date();
  return `${`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`}`;
}

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

// set up express session to login and logout users
app.use(
  session({
    secret: "SECRET KEY",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: DB_URL,
      autoRemove: "native",
      ttl: 14 * 24 * 60 * 60,
    }),
  })
);

app.get("/", (req, res) => {
  res.render("index", { isAuth: req.session.isAuth });
});

app.get("/menu", (req, res) => {
  res.render("menu", { isAuth: req.session.isAuth });
});

app.get("/reservation", (req, res) => {
  if (req.session.isAuth) {
    return res.render("reservation", { isAuth: req.session.isAuth });
  }
  res.send("<h1>Error 404<h1>");
});

app.get("/login", (req, res) => {
  if (req.session.isAuth || req.session.userId) {
    return res.redirect("/");
  }
  res.render("login", { isAuth: req.session.isAuth });
});

app.get("/faq", (req, res) => {
  res.render("faq", { isAuth: req.session.isAuth });
});

app.get("/orderHistory", (req, res) => {
  if (req.session.isAuth) {
    return res.render("orderHistory", { isAuth: req.session.isAuth });
  }
  res.send("<h1>Error 404<h1>");
});

app.get("/help", (req, res) => {
  res.render("help", { isAuth: req.session.isAuth });
});

// making sure that user can only access payment page, when there is an order
app.get("/payment", async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (user && user.currentOrder?.items?.length > 0) {
    res.render("payment", {
      isAuth: req.session.isAuth,
    });
  } else {
    res.send("<h1>Error 404<h1>");
  }
});

// API to get current order of the logged in user
app.get("/api/currentOrder", async (req, res) => {
  if (!req.session.isAuth) {
    return res.json({ ok: false, message: "UnAuthorized Access!" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (user.currentOrder && user.currentOrder.items.length > 0) {
      return res.json({ ok: true, data: user.currentOrder });
    } else {
      return res.json({ ok: false, message: "No current order" });
    }
  } catch (e) {
    return res.json({ ok: false, message: "Something went wrong" });
  }
});

// POST method to create user
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      res.json({ ok: false, message: "User already exists with that email" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashedPassword });
      await user.save();
      // saving the user to session
      req.session.isAuth = true;
      req.session.email = user.email;
      req.session.userId = user._id;
      res.json({ ok: true, message: "Account created" });
    }
  } catch (error) {
    res.json({ ok: false, message: "Something went wrong!" });
  }
});

// POST method to login user
app.post("/api/login", async (req, res) => {
  const data = req.body;

  const user = await User.findOne({ email: data.email });
  if (!user)
    return res.json({
      ok: false,
      message: `No User Exists with that email`,
    });

  const isCorrectPassword = await bcrypt.compare(data.password, user.password);
  if (!isCorrectPassword) {
    return res.json({ message: `Invalid Credentials`, ok: false });
  }
  // saving the user to session
  req.session.isAuth = true;
  req.session.email = user.email;
  req.session.userId = user._id;

  return res.json({ ok: true });
});

// POST method to get the current logged in user
app.post("/api/me", async (req, res) => {
  if (req.session.isAuth) {
    const user = await User.findById(req.session.userId);
    const { name, email, _id } = user;
    return res.send({
      message: `Already Logged In`,
      data: { name, email, userId: _id },
      ok: true,
    });
  } else {
    res.json({ ok: false, message: "Not logged in" });
  }
});

// POST method which log's out the logged in user
app.get("/api/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// POST method to save the current order
app.post("/api/currentOrder", async (req, res) => {
  const order = req.body;
  const user = await User.findById(req.session.userId);
  if (user) {
    user.currentOrder = order;
    await user.save();
    res.json({ ok: true });
  } else {
    res.json({ ok: false, message: "someting went wrong" });
  }
});

// POST method which handles the order and payment data
app.post("/api/payment", async (req, res) => {
  const payment = req.body;
  const user = await User.findById(req.session.userId);

  if (user && user.currentOrder?.items?.length > 0) {
    const order = user.currentOrder;
    const newOrder = new Order({
      userId: user._id,
      username: user.username,
      items: order.items,
      total: order.total,
      comment: order.comment,
      status: "delivered",
      type: payment.type,
      payment: {
        cardNo: payment.creditCardNo,
        cvv: payment.cvv,
        exp: payment.expDate,
      },
      paid: true,
      timestamp: new Date().getTime(),
      date: getCurrentDate(),
    });

    // adding address to order, if it is delivery type of order
    if (payment.address) {
      newOrder.address = payment.address;
    }

    await newOrder.save();
    user.currentOrder = { items: [], total: 0, comment: "" };
    await user.save();
    
    // sending response message based on whether it is a delivery or takeaway
    const message =
      payment.type === "delivery"
        ? "Your Order will be delivered in 45 mins"
        : "Your Order will be prepared in 30 mins";
    res.json({ ok: true, message });
  } else {
    res.json({ ok: false, message: "Invalid Request" });
  }
});

// GET method which returns the order history of the user
app.get("/api/ordersHistory", async (req, res) => {
  const userId = req.session.userId;
  if (req.session.isAuth && userId) {
    // retreiving orders by userId in the desc order of timestamp
    const orders = await Order.find({ userId }).sort("-timestamp").exec();
    res.json({ ok: true, data: orders });
  } else {
    res.json({ ok: false, message: "Invalid request" });
  }
});

// GET method which returns the reservation made by user
app.get("/api/reservations", async (req, res) => {
  if (!req.session.userId) {
    return res.json({
      ok: false,
      message: "You must be logged in to view your reservations",
    });
  }
  // retreiving reservations by userId in the desc order of timestamp
  const userReservations = await Reservation.find({
    userId: req.session.userId,
  })
    .sort("-date")
    .exec();
  res.json({ ok: true, reservations: userReservations }); // send reservations as an array
});

// POST method that saves a reservation made by user
app.post("/api/reservation", async (req, res) => {
  const reservation = req.body;
  if (!req.session.userId) {
    return res.json({
      ok: false,
      message: "You must be logged in to make a reservation",
    });
  }
  try {
    const user = await User.findById(req.session.userId);
    const newReservation = new Reservation({
      userId: user._id,
      username: user.username,
      time: reservation.time,
      noOfPersons: reservation.noOfPersons,
      phone: reservation.phone,
      date: reservation.date,
    });
    await newReservation.save();
    res.json({ ok: true });
  } catch (e) {
    console.log(e);
    res.json({ ok: false, message: "Something went wrong" });
  }
});

// POST method to save the message made by user via the contact form
app.post("/api/message", async (req, res) => {
  const message = req.body;
  try {
    const newMessage = new ContactMessage(message);
    await newMessage.save();
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false });
  }
});

// connecting to mongodb through mongoose
mongoose
  .connect(DB_URL)
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.log("Error", err));

// starting the express server in port 5000  
app.listen(5000, () => console.log(`app running on http://localhost:${PORT}/`));
