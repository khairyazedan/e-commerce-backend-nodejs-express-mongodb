const { createBackup, restoreDB } = require("../services/dbBackup.service.js");
const catchAsync = require("../utils/catchAsync.utils.js");
const AppError = require("../utils/appError.utils.js");

exports.createBackup = catchAsync(async (req, res) => {
  const folderName = await createBackup();
  res.status(201).json({ message: 'Backup created', folderName });
});
 

exports.createRestore = catchAsync(async (req, res) => {
    const { folderName } = req.body;
    if (!folderName) throw new AppError("folderName is required", 422);
  
    await restoreDB(folderName);
    res.status(200).json({ message: "Restore success" });
  });

