const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const Car = require("../models/car");

router.get("/", (req, res, next) => {
      Car.aggregate([
                    {
                        $geoNear: {
                            near: {type:'Point', coordinates:[parseFloat(req.query.lng), parseFloat(req.query.lat)]},
                            distanceField: "dist.calculated",
                            maxDistance: 1000000000000,
                            spherical: true                
                        }
                    }
                ]).then(docs => {
      const response = {
        count: docs.length,
        cars: docs.map(doc => {
          return {
            name: doc.name,
            loc: doc.loc,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/cars/" + doc._id
            }
          };
        })
      };
      //   if (docs.length >= 0) {
      res.status(200).json(response);
      //   } else {
      //       res.status(404).json({
      //           message: 'No entries found'
      //       });
      //   }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/", checkAuth, (req, res, next) => {
  const car = new Car({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    loc: req.body.loc
  });
  car
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "car location posted on server",
        createdCar: {
            name: result.name,
            loc: result.loc,
            _id: result._id,
            request: {
                type: 'GET',
                url: "http://localhost:3000/cars/" + result._id
            }
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

router.get("/:carId", (req, res, next) => {
  const id = req.params.carId;
  Car.findById(id)
    .select('name loc _id ')
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
            car: doc,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/cars'
            }
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:carId", checkAuth, (req, res, next) => {
  const id = req.params.carId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Car.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Car location updated',
          request: {
              type: 'GET',
              url: 'http://localhost:3000/cars/' + id
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

router.delete("/:carId", checkAuth, (req, res, next) => {
  const id = req.params.carId;
  Car.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Car  details deleted',
          request: {
              type: 'POST',
              url: 'http://localhost:3000/cars',
              body: { name: 'String', loc: 'Number' }
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

module.exports = router;
