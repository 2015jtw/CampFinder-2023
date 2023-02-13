if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
// express and mongoose
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash')

// models and schemas
const Campground = require('./models/campground');
const Review = require('./models/review')
const methodOverride = require('method-override');
const {campgroundSchema, reviewSchema} = require('./schemas')

// error handling
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError')

// routes
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users');

// authentication
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const { FORMERR } = require('dns');
const { use } = require('passport');
const user = require('./models/user');

// deploying
const dbUrl = process.env.DB_URL


mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log('database connected')
});

const app = express();

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// session and flash
app.use(session(sessionConfig))
app.use(flash());

// authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// flash middleware
app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// refactoring routes
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);



// home page
app.get('/', (req, res ) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next ) => {
    const {statusCode = 500} = err;
    if(!err.msg) err.msg = "Oh no, something went wrong."
    res.status(statusCode).render('error', {err})
})



app.listen(3000, () => console.log('serving on port 3000'));