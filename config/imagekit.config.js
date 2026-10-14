const ImageKitModule = require("@imagekit/nodejs");
const ImageKit = ImageKitModule.default ?? ImageKitModule;

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

module.exports = client;