const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers')
const axios = require('axios');


mongoose.connect("mongodb://localhost:27017/camp-finder");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log('database connected')
});

const sample = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seedImg() {
    try {
      const resp = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          client_id: 'lTmxSRnK6ouaykjFTXkvPNfGQJ3lPbx2EuaVa1XvKgs',
          collections: 1114848,
        },
      })
      return resp.data.urls.small
    } catch (err) {
      console.error(err)
    }
  }
  

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i =0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 35) + 10;
        const camp = new Campground({
            author: `637517a86c196336c3766321`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry : {
              type: "Point", 
              coordinates: [
                  cities[random1000].longitude,
                  cities[random1000].latitude
              ]
            },
            images:  [
              {
                url: 'https://res.cloudinary.com/dqazaofh2/image/upload/v1669069242/Campfinder/hphzshf3vfg6pstyyeha.jpg',
                filename: 'Campfinder/hphzshf3vfg6pstyyeha'
              },
              {
                url: 'https://res.cloudinary.com/dqazaofh2/image/upload/v1669069248/Campfinder/mqqmhliarp3tdsjeimio.jpg',
                filename: 'Campfinder/mqqmhliarp3tdsjeimio'
              },
              {
                url: 'https://res.cloudinary.com/dqazaofh2/image/upload/v1669069253/Campfinder/x6upbnceejx4e3u6oyj9.jpg',
                filename: 'Campfinder/x6upbnceejx4e3u6oyj9'
              },
              {
                url: 'https://res.cloudinary.com/dqazaofh2/image/upload/v1669069255/Campfinder/xo8rzvwmpknljwsk0dvu.jpg',
                filename: 'Campfinder/xo8rzvwmpknljwsk0dvu'
              },
              {
                url: 'https://res.cloudinary.com/dqazaofh2/image/upload/v1669069256/Campfinder/o0iq0opbh5ezers4cwmw.jpg',
                filename: 'Campfinder/o0iq0opbh5ezers4cwmw'
              },
              {
                url: 'https://res.cloudinary.com/dqazaofh2/image/upload/v1669069264/Campfinder/hkxqybn4vmwhlvxc83b4.jpg',
                filename: 'Campfinder/hkxqybn4vmwhlvxc83b4'
              },
              {
                url: 'https://res.cloudinary.com/dqazaofh2/image/upload/v1669069266/Campfinder/ox6cpeqdggjw2lom2dy4.jpg',
                filename: 'Campfinder/ox6cpeqdggjw2lom2dy4'
              }
            ],
            description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})