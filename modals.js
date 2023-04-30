/**
* Name: Anupama Hazarika, Ananmay Rajan & Jenan Meri
* Course: Csc 337
* Purpose: The modals.js file is responsible for all database schemas linked to the restaurant website. Some of schemas added below are: 
* UserSchema, ItemSchema, OrderSchema, Reservation Schema & Message Schema. 
*/
const mongoose = require("mongoose");

// User schema holds the details related to account of the every users.
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  currentOrder: {
    items: [],
    total: Number,
    comment: String,
  },
});

// Item schema stores information of the Food items, which include the title, price, image as attributes.
const ItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
});

// Order schema stores the details regarding orders made by the users.
const OrderSchema = new mongoose.Schema({
  userId: String,
  username: String,
  items: [],
  total: Number,
  status: String,
  type: String,
  paid: Boolean,
  payment: {
    cardNo: String,
    cvv: String,
    exp: String,
  },
  address: String,
  comment: String,
  timestamp: Number,
  date: Date,
});

// Reservation defines the structure of the reservation collection in mongodb, this includes the date and time reservation made by the users.
const ReservationSchema = new mongoose.Schema({
  userId: String,
  username: String,
  time: String,
  noOfPersons: Number,
  phone: String,
  date: Date,
  createdAt: Number,
});

// Message schema holds the details sent from the contact form, which includes the name and message entered by the users.
const MessageSchema = new mongoose.Schema(
  {
    name: String,
    text: String,
    createdAt: Number,
  },
  { timestamps: true }
);

// Creating Database models based of the schema created above,
// schema tells how a data should be and Models actually connect database to our node application.
const User = mongoose.model("user", UserSchema);
const Item = mongoose.model("item", ItemSchema);
const Order = mongoose.model("order", OrderSchema);
const Reservation = mongoose.model("reservation", ReservationSchema);
const ContactMessage = mongoose.model("message", MessageSchema);

module.exports = { User, Item, Order, Reservation, ContactMessage };
