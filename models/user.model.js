const mongoose = require('mongoose');
const crypto = require('crypto');
const { v1: uuidv1 } = require('uuid');

// Définition du schéma utilisateur
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Name is required'],
    maxlength: [32, 'Name cannot exceed 32 characters'],
  },
  email: {
    type: String,
    trim: true,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  hashed_password: {
    type: String,
    required: [true, 'Password is required'],
  },
  salt: {
    type: String,
  },
  about: {
    type: String,
    trim: true,
  },
  role: {
    type: Number,
    default: 0, // 0 = Utilisateur, 1 = Admin
  },
  history: {
    type: Array,
    default: [],
  },
}, { timestamps: true });

// Champ virtuel pour le mot de passe
userSchema.virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = uuidv1(); // Génère un sel unique
    this.hashed_password = this.encryptPassword(password); // Hache le mot de passe
  })
  .get(function() {
    return this._password;
  });

// Méthodes de l'utilisateur
userSchema.methods = {
  /**
   * Vérifie si le mot de passe est correct
   * @param {String} plainText - Mot de passe non haché
   * @returns {Boolean} - Résultat de la vérification
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  /**
   * Hachage du mot de passe
   * @param {String} password - Mot de passe non haché
   * @returns {String} - Mot de passe haché ou chaîne vide si erreur
   */
  encryptPassword: function(password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt) // Utilise le sel
        .update(password) // Ajoute le mot de passe
        .digest('hex'); // Génère le hash
    } catch (err) {
      return '';
    }
  },
};

// Gestionnaire d'erreurs pour un email unique
userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

// Export du modèle
module.exports = mongoose.model('User', userSchema);
