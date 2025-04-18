// mongooseConnexion.js

const mongoose = require('mongoose');

async function connectToMongo() {
  try {
    console.log("URI MongoDB :", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connexion à MongoDB réussie !");
  } catch (err) {
    console.error("Erreur de connexion MongoDB : ", err);
  }
}

connectToMongo();

module.exports = mongoose;
