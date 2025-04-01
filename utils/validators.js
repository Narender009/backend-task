// utils/validators.js
const validateEmail = (email) => {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(String(email).toLowerCase());
  };
  
  const validatePassword = (password) => {
    return password.length >= 6;
  };
  
  const validateBlogInput = (title, description) => {
    const errors = {};
    
    if (!title) {
      errors.title = 'Title is required';
    } else if (title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    if (!description) {
      errors.description = 'Description is required';
    } else if (description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  };
  
  const validateCommentInput = (content) => {
    const errors = {};
    
    if (!content) {
      errors.content = 'Content is required';
    } else if (content.length < 3) {
      errors.content = 'Content must be at least 3 characters';
    }
    
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  };
  
  module.exports = {
    validateEmail,
    validatePassword,
    validateBlogInput,
    validateCommentInput
  };