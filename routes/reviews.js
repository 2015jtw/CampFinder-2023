const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground');
const Review = require('../models/review')
const {reviewSchema} = require('../schemas')
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')

// import controller
const reviews = require('../controllers/reviews');


// creating a campground review
router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview));

module.exports = router;