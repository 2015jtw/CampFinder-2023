const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports.index = async (req, res) => {

    // search engine error handling
    let noMatch = "";

    // search engine code
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');

        const campgrounds = await Campground.find({title: regex}).exec(function (err, campgrounds) {
            Campground.countDocuments({title: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(campgrounds.length < 1) {
                        noMatch = "No campgrounds match that query, please try again.";
                    }
                    res.render("campgrounds/index", {
                        campgrounds: campgrounds,
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
            });
        });
    }
    else{
        
        // get all campgrounds from mongo db
        const campgrounds = await Campground.find({}).exec(function (err, allCampgrounds) {
            Campground.countDocuments().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
    })}};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)

    
};

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({path: 'reviews', 
    populate: {path: 'author'}}).populate('author');
    
    if(!campground){
        req.flash('error', 'Campground not found.')
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}


module.exports.editForm = async(req, res) => {
    const {id} = req.params.id;
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error', 'Campground not found.')
        res.redirect('/campgrounds');
    }
    
    res.render('campgrounds/edit', {campground});
}


module.exports.updateCampground = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)

};

module.exports.deleteCampground = async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground!');
    res.redirect('/campgrounds')
};
