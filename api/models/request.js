const mongoose = require('mongoose');

const requestSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    cloc:{
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

module.exports = mongoose.model('Request', requestSchema);