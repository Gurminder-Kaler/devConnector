const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateEducationInput (data) {
    let errors = {};
    data.school = !isEmpty(data.school) ? data.school : '';
    data.degree = !isEmpty(data.degree) ? data.degree : '';
    data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
    data.from = !isEmpty(data.from) ? data.from : '';


    if(Validator.isEmpty(data.school)) {
        errors.school = "Job Title is invalid";
    }

    if(Validator.isEmpty(data.degree)) {
        errors.degree = "Company field is invalid";
    }

    if(Validator.isEmpty(data.fieldofstudy)) {
        errors.fieldofstudy = "Field of study field is invalid";
    }

    if(Validator.isEmpty(data.from)) {
        errors.from = "From Date field is invalid";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};