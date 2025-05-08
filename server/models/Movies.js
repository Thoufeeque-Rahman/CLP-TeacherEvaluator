const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    plot: { type: String, required: true },
    genres: { type: [String], required: true },
    runtime: { type: Number, required: true },
    cast: { type: [String], required: true },
    poster: { type: String },
    title: { type: String, required: true },
    fullplot: { type: String },
    languages: { type: [String], required: true },
    released: { type: Date },
    directors: { type: [String], required: true },
    rated: { type: String },
    awards: {
        wins: { type: Number, default: 0 },
        nominations: { type: Number, default: 0 },
        text: { type: String }
    },
    lastupdated: { type: String },
    year: { type: Number, required: true },
    imdb: {
        rating: { type: Number },
        votes: { type: Number },
        id: { type: Number }
    },
    countries: { type: [String], required: true },
    type: { type: String, required: true },
    tomatoes: {
        viewer: {
            rating: { type: Number },
            numReviews: { type: Number },
            meter: { type: Number }
        },
        fresh: { type: Number },
        critic: {
            rating: { type: Number },
            numReviews: { type: Number },
            meter: { type: Number }
        },
        rotten: { type: Number },
        lastUpdated: { type: Date }
    },
    num_mflix_comments: { type: Number, default: 0 }
});

module.exports = mongoose.model('Movie', MovieSchema);