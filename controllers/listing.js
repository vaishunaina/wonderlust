const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
}

module.exports.renderNewForm = (req,res) => {
    res.render("./listings/new.ejs");
}; 

module.exports.showListing = (async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate:{
            path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested does not exist!!");
        res.redirect("/listings");
    }
    
    res.render("./listings/show.ejs",{listing});
    
});

module.exports.createListing = (async(req,res,next) => {
    let response = await geocodingClient
        .forwardGeocode({
        // query: "New Delhi, India",
        query: req.body.listing.location,
        limit: 1,  // to limit the number of locations given in O/P
        })         // the response will be in features objects if limit is given 2/3/4 then the feature array object will be of size 2/3/4
        .send();   // with different locations in given area

    // let {title, description, image, price, country, location} = req.body;
    // let listing = req.body.listing; // to make the syntax short we use object and key:value pair to extract the data
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
});

module.exports.editListing = (async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested does not exist!!");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("./listings/edit.ejs",{listing, originalImageUrl});
});

module.exports.updateListing = (async (req,res)=> {   
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing}); // "..." -> deconstructing the Js object into individual elements
    
    if(typeof req.file !== "undefined"){  // at the time of edit if we dont upload new images and use the already old existing images
        let url = req.file.path;          // the these steps are not required as if we do these steps
        let filename = req.file.filename; // the url adn filename will be undefined.
        listing.image = {url, filename};
        await listing.save();
    }
    
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
});

module.exports.deleteListing = (async (req,res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
});