const url = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .refine(
    (u) => u.startsWith(process.env.IMAGEKIT_URL_ENDPOINT + "/"),
    "Image must be hosted on ImageKit"
  );