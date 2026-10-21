const str = (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined);
 
module.exports = (Model, options = {}) => {
  const {
    buildFilter = () => ({}),
    sorts,
    defaultSort = sorts ? "newest" : "createdAt",
    populate,
    lean = false,
    defaultLimit = 10,
    maxLimit = 50,
  } = options;
 
  return async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(str(req.query.page), 10) || 1);
      const limit = Math.min(maxLimit, Math.max(1, parseInt(str(req.query.limit), 10) || defaultLimit));
      const skip = (page - 1) * limit;
 
      let sort;
      if (sorts) {
        sort = sorts[str(req.query.sort)] || sorts[defaultSort];
      } else {
        const order = req.query.order === "desc" ? -1 : 1;
        sort = { [str(req.query.sort) || defaultSort]: order };
      }
 
      const filter = buildFilter(req.query);
 
      let query = Model.find(filter).sort(sort).skip(skip).limit(limit);
      if (populate) query = Array.isArray(populate) ? query.populate(...populate) : query.populate(populate);
      if (lean) query = query.lean();
 
      const [data, total] = await Promise.all([query, Model.countDocuments(filter)]);
 
      res.status(200).json({
        message: `pagination for ${Model.modelName}`,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        data,
      });
    } catch (err) {
      next(err);
    }
  };
};
 