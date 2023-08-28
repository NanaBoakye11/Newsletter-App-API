const express = require("express");
const mongoose = require("mongoose");
const MongoDBStore = require('connect-mongodb-session')(session);
mongoose.set("strictQuery", false);
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;

var ensureLoggedIn = ensureLogIn();