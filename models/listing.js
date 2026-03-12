const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// image sub-schema
const imageSchema = new Schema(
  {
    filename: String,
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    },
  },
  { _id: false }
);

// listing schema
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  image: {
    type: imageSchema,
    default: {},
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  location: {
    type: String,
    required: true,
    trim: true,
  },

  country: {
    type: String,
    required: true,
    trim: true,
  },
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;