const mongoose = require('mongoose')
const { Schema } = mongoose;
const Review = require('./review')


const ImageSchema = new Schema({
  url: String,
  filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
  return this.url.replace('upload', '/upload/w_200')
})

const opts = {toJSON: {virtuals: true}}; 

const campgroundSchema = new Schema({
    title:  String, // String is shorthand for {type: String}
    images: [ImageSchema],
    geometry: {
      type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
      },
      coordinates: {
          type: [Number],
          required: true
      }
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review'
      }
    ]
}, opts);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
  return `<h5>${this.title}</h5>
  <p>$${this.price} a night</p>
  <button class="btn btn-primary"><a style="color:white;text-decoration:none" href="/campgrounds/${this._id}">See Campground</a></button>`
});



campgroundSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
      await Review.deleteMany({
          _id: {
              $in: doc.reviews
          }
      })
  }
})

  
module.exports = mongoose.model('Campground', campgroundSchema);

