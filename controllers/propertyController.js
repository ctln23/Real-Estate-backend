const Property = require('../models/Property')
const propertyController = require('express').Router()
const verifyToken = require("../middlewares/verifyToken")

//get all
propertyController.get('/getAll', async (req, res) => {
    try {
        console.log("Fetching all properties...");
        const properties = await Property.find({}).populate("currentOwner", '-password')
        console.log("Properties fetched successfully:", properties);
        return res.status(200).json(properties);
    } catch (error) {
        console.error("Error fetching properties:", error.message);
        return res.status(500).json(error.message);
    }
});

//get featured
propertyController.get('/find/featured', async(req, res) => {
    try {
        const featuredProperties = await Property.find({featured: true}).populate('currentOwner', '-password')
        return res.status(200).json(featuredProperties)
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

//get all from specific type
propertyController.get('/find', async(req, res) => {
    const type = req.query
    try {
        if (type){
            const properties = await Property.find(type).populate('currentOwner', '-password')
            return res.status(200).json(properties)
        } else{
            return res.status(500).json({msg: "No such type"})
        }
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

//get counts of types (eg: {beach: 2, mountain: 3, village: 2})
propertyController.get('/find/types', async(req, res) => {
    try {
        const beachType = await Property.countDocuments({type: 'beach'})
        const mountainType = await Property.countDocuments({type: 'mountain'})
        const villageType = await Property.countDocuments({type: 'village'})
        return res.status(200).json({
            beach: beachType,
            mountain: mountainType,
            village: villageType
        })
    } catch (error) {
        return res.status(500).json(error.message)        
    }
})

//get individual property
propertyController.get('/find/:id', async(req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('currentOwner', '-password')
        if (!property){
            throw new Error("No such property exists with this id")
        } else{
            return res.status(200).json(property)
        }
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

//create a property
propertyController.post('/', verifyToken, async(req, res) => {
    try {
        const newProperty = await Property.create({...req.body, currentOwner: req.user.id})
        return res.status(201).json(newProperty)
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

//update a property
propertyController.put("/:id", verifyToken, async(req, res) => {
    try {
        const property = await Property.findById(req.params.id)
        if (property.currentOwner.toString() !== req.user.id.toString()){
            throw new Error("Sorry! You are not allowed to update someone else's property")
        } else{
            const updatedProperty = await Property.findByIdAndUpdate(
                req.params.id,
                {$set: req.body},
                {new: true}        //this is imp cuz otherwise it will update it by will return the old one
            )
            return res.status(200).json(updatedProperty)
        }
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

//delete a property
propertyController.delete('/:id', verifyToken, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        if (property.currentOwner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "You are not allowed to delete someone else's property" });
        }
        await Property.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
        return res.status(500).json(error.message);
    }
})

module.exports = propertyController