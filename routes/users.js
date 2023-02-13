const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');

// import controllers
const reviews = require('../controllers/users');


router.get('/register', reviews.renderRegister)

router.post('/register', wrapAsync(reviews.register));

router.get('/login', reviews.renderLogin);

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), reviews.login)

router.get('/logout', reviews.logout); 
  
module.exports = router;

