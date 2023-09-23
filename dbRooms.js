const mongoose = require('mongoose');

const roomShema = new mongoose.Schema(
  {
    name: String,
  },
  {
    timestamps: true,
  }
);

const Rooms = mongoose.model('rooms', roomShema);

module.exports = Rooms;
