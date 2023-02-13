const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground');
const Joi = require('joi');
const {campgroundSchema, reviewSchema} = require('../schemas')
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// controllers
const campgrounds = require('../controllers/campgrounds');

// view main campground page INDEX PAGE
router.get('/', wrapAsync(campgrounds.index));

// view creating new campground page NEW PAGE
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// creating a new campground
router.post('/', isLoggedIn, upload.array('image'), validateCampground, wrapAsync(campgrounds.createCampground))

// view individual campground page SHOW PAGE
router.get('/:id', wrapAsync(campgrounds.showCampground))

// view campground edit page EDIT PAGE
router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(campgrounds.editForm))

// updating a campground request
router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, wrapAsync(campgrounds.updateCampground));

// deleting a campground request
router.delete('/:id', isLoggedIn, isAuthor, campgrounds.deleteCampground)

module.exports = router;
