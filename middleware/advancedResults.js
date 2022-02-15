const advancedResults = (model, populate) => async (req, res, next) => {
  const removeFields = ['select', 'sort', 'page', 'limit'];
  const initialQuery = { ...req.query };
  let finalQuery;
  
  removeFields.forEach(field => delete initialQuery[field]);
  
  const queryStr = 
    JSON.stringify(initialQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  finalQuery = model.find(JSON.parse(queryStr));

  if(req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    finalQuery = finalQuery.select(fields);
  }
  if(req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    finalQuery = finalQuery.sort(sortBy);
  } else {
    finalQuery = finalQuery.sort('-createdAt');
  }
  if(populate) {
    finalQuery = finalQuery.populate(populate);
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  finalQuery = finalQuery.skip(startIndex).limit(limit);

  const results = await finalQuery;

  const pagination = {};

  if(endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    }
  }
  if(startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    }
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  }

  next();
}

module.exports = advancedResults;