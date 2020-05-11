const mongoose = require('mongoose');


const carSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    loc: {
        type: {
          type: String, 
          default:"Point", 
          required: true
        },
        coordinates: {
          type: [Number],
          index: "2dsphere",
          required: true
        }
      }


});

module.exports = mongoose.model('Car', carSchema);