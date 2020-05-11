const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require('../middleware/check-auth');

const Request = require("../models/request");
const Car = require("../models/car");

// Handle incoming GET requests to /requests
router.get("/", checkAuth, (req, res, next) => {
  Request.find()
    .select("car cloc _id")
    .populate('car', 'name')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        requests: docs.map(doc => {
          return {
            _id: doc._id,
            car: doc.car,
            cloc: doc.cloc,
            request: {
              type: "GET",
              url: "http://localhost:3000/requests/" + doc._id
            }
          };
        })
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.post("/", checkAuth, (req, res, next) => {
  Car.findById(req.body.carId)
    .then(car => {
      if (!car) {
        return res.status(404).json({
          message: "Car not found"
        });
      }
      const request = new Request({
        _id: mongoose.Types.ObjectId(),
        cloc: req.body.cloc,
        car: req.body.carId
      });
      return request.save();
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Request stored",
        createdRequest: {
          _id: result._id,
          car: result.car,
          cloc: result.cloc
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/requests/" + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get("/:requestId", checkAuth, (req, res, next) => {
  Request.findById(req.params.requestId)
    .populate('car')
    .exec()
    .then(request => {
      if (!request) {
        return res.status(404).json({
          message: "Request not found"
        });
      }
      res.status(200).json({
        request: request,
        request: {
          type: "GET",
          url: "http://localhost:3000/requests"
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/:requestId", checkAuth, (req, res, next) => {
  Request.remove({ _id: req.params.requestId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Request deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/requests",
          body: { carId: "ID", cloc: "Number" }
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
