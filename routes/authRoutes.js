// import express from "express";
// import { registerUser, loginUser } from "../controller/authController";
const express = require("express");
const { registerUser, loginUser } = require("../controller/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
