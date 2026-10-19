const slugify = require('slugify');
const AppError = require("./appError.utils.js");

const makeSlug = (text)=> slugify(text, {lower: true,strict: true, trim: true})

async function uniqueSlug(Model, text, excludeId = null){
    const base = makeSlug(text) ||  `item-${Date.now().toString(36)}`;
    let slug = base;
    let n = 2; 
 
    while(await Model.exists({ slug, ...(excludeId && { _id: { $ne: excludeId } })})){
        slug = `${base}-${n++}`;
    
    }
    return slug;
}

async function resolveSlug(Model, { slug, name }, excludeId = null) {
    if (slug) {
      const taken = await Model.exists({
        slug,
        ...(excludeId && { _id: { $ne: excludeId } }),
      });
      if (taken) {
        throw new AppError(`A ${Model.modelName.toLowerCase()} with this slug already exists`, 409);
      }
      return slug;
    }
    return uniqueSlug(Model, name, excludeId);
  }

module.exports = { makeSlug, uniqueSlug, resolveSlug};