const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/expressErrors");
const { listingSchema } = require("./schema");

const path = require("path");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

// Database connection
mongoose
  .connect(mongo_url)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to Wanderlust");
});

// Joi validation middleware
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// INDEX route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  })
);

// NEW route
app.get("/listings/new", (req, res) => {
  res.render("listings/new");
});

// SHOW route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ExpressError(400, "Invalid Listing ID");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show", { listing });
  })
);

// CREATE route
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

// EDIT route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/edit", { listing });
  })
);

// UPDATE route
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

// DELETE route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

// 404 handler
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).send(message);
});

// Server start
app.listen(8080, () => {
  console.log("Server running on port 8080");
});