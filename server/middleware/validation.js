const { body, param, query, validationResult } = require('express-validator');

// Middleware to validate results and send errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User validation rules
const userValidation = {
  // Register validation
  register: [
    body('firstName')
      .trim()
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    
    body('lastName')
      .trim()
      .notEmpty().withMessage('Last name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    
    body('phone')
      .trim()
      .notEmpty().withMessage('Phone number is required')
      .matches(/^(\+998|998)?[0-9]{9}$/).withMessage('Please enter a valid Uzbekistan phone number'),
    
    body('regionId')
      .notEmpty().withMessage('Region is required'),
    
    validate,
  ],
  
  // Update profile validation
  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    
    body('phone')
      .optional()
      .trim()
      .matches(/^(\+998|998)?[0-9]{9}$/).withMessage('Please enter a valid Uzbekistan phone number'),
    
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
    
    body('regionId')
      .optional()
      .notEmpty().withMessage('Region cannot be empty if provided'),
    
    validate,
  ],
};

// Issue validation rules
const issueValidation = {
  // Create issue validation
  createIssue: [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
    
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
    
    body('location.isNationwide')
      .isBoolean().withMessage('isNationwide must be a boolean'),
    
    body('location.regionId')
      .custom((value, { req }) => {
        if (!req.body.location.isNationwide && !value) {
          throw new Error('Region is required for non-nationwide issues');
        }
        return true;
      }),
    
    body('mediaUrls')
      .optional()
      .isArray().withMessage('mediaUrls must be an array'),
    
    body('mediaUrls.*')
      .optional()
      .isURL().withMessage('Each media URL must be a valid URL'),
    
    validate,
  ],
  
  // Update issue validation
  updateIssue: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
    
    body('status')
      .optional()
      .isIn(['Pending', 'In Progress', 'Resolved']).withMessage('Invalid status value'),
    
    validate,
  ],
  
  // Vote validation
  vote: [
    body('priority')
      .notEmpty().withMessage('Priority is required')
      .isIn(['Important', 'Very Important', 'Urgent']).withMessage('Invalid priority value'),
    
    validate,
  ],
};

// Comment validation rules
const commentValidation = {
  // Create comment validation
  createComment: [
    body('content')
      .trim()
      .notEmpty().withMessage('Comment content is required')
      .isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
    
    body('issueId')
      .notEmpty().withMessage('Issue ID is required'),
    
    body('parentCommentId')
      .optional(),
    
    body('mediaUrls')
      .optional()
      .isArray().withMessage('mediaUrls must be an array'),
    
    body('mediaUrls.*')
      .optional()
      .isURL().withMessage('Each media URL must be a valid URL'),
    
    validate,
  ],
  
  // Update comment validation
  updateComment: [
    body('content')
      .trim()
      .notEmpty().withMessage('Comment content is required')
      .isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
    
    validate,
  ],
};

// Search validation rules
const searchValidation = {
  // Search issues validation
  searchIssues: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
    
    query('region')
      .optional(),
    
    query('status')
      .optional()
      .isIn(['Pending', 'In Progress', 'Resolved', '']).withMessage('Invalid status value'),
    
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'votes', '']).withMessage('Invalid sort field'),
    
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc', '']).withMessage('Invalid sort order'),
    
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    
    validate,
  ],
};

// ID parameter validation
const idValidation = param('id')
  .isMongoId().withMessage('Invalid ID format');

module.exports = {
  validate,
  userValidation,
  issueValidation,
  commentValidation,
  searchValidation,
  idValidation,
};