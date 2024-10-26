const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
  emailAddresses: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  fullName: { type: String },
  imageUrl: { 
    type: String, 
    default: "http://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-High-Quality-Image.png" 
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

// Check if the model is already registered, otherwise register it
const User = mongoose.models.User || model('User', userSchema);

module.exports = User;
