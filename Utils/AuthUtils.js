const validator = require('validator');

const cleanUpAndValidate = ({
  name,
  username,
  email,
  password,
  update,
  bio,
  niche,
}) => {
  return new Promise((resolve, reject) => {
    
    if (!name) reject('Name is required');
    if (!username) reject('Username is required');

    if (typeof username !== 'string') reject('Invalid Username');

    if (typeof name !== 'string') reject('Invalid Name');

    if (update) {
       
      if (!bio) reject('Bio is required');
    if (!niche) reject('niche is required');
      if (typeof bio !== 'string') reject('Invalid Bio');
      if (typeof niche !== 'string') reject('Invalid niche');

      if (bio.length < 20) {
        reject('Bio is too short');
      }
      if (bio.length > 255) {
        reject('Bio is too long');
      }

      if (niche.length < 2) {
        reject('Write a proper niche');
      }
      if (niche.length > 25) {
        reject('Write a concise niche');
      }
    }

    if (username.length < 3 || username.length > 20)
      reject('Username length should be 2-20 characters long');

    if (!update) {
      if (!email) reject('Email is required');

      if (!password) reject('Password is required');

      if (typeof password !== 'string') reject('Invalid Password');

      if (!validator.isEmail(email)) reject('Invalid email format');
    }

    resolve();
  });
};

const loginValidation = ({ loginId, password }) => {
  return new Promise((resolve, reject) => {
    if (!loginId) reject('loginId missing');
    if (!password) {
      reject('Password missing');
    }

    resolve();
  });
};

module.exports = { cleanUpAndValidate, loginValidation };
