const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data) {
  let errors = {};

  
  data.text = !isEmpty(data.text) ? data.text : '';
  // data.password = !isEmpty(data.password) ? data.password : '';


  if(Validator.isEmpty(data.text)) {
    errors.text = 'Text is required';
  }

  if(!Validator.isLength(data.text, { min: 10, max: 300})) {
    errors.text = 'Text must be between 10 to 300 chars';
  }


  return {
    errors,
    isValid: isEmpty(errors)
  }
}