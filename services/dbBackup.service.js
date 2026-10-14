const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger.util.js'); 
const AppError = require("../utils/appError.utils.js")
// try to backup specific collection or db

const BACKUPS_DIR = path.join(__dirname, '..', 'backups');

const run = (cmd, args) =>
  new Promise((resolve, reject) => {
    execFile(cmd, args, (error, stdout, stderr) => {
      if (error) {
        logger.error(`${cmd} failed: ${stderr || error.message}`);
        return reject(new AppError(`${cmd} failed`, 500));
      }
      resolve(stdout);
    });
  });

exports.createBackup = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const folderName = `backup-${timestamp}`;
  const backupFolder = path.join(BACKUPS_DIR, folderName);

  fs.mkdirSync(BACKUPS_DIR, { recursive: true });

  try {
    await run('mongodump', [
      `--uri=${process.env.DB_CONNECTION_STRING}`,
      `--out=${backupFolder}`,
      '--gzip',
    ]);
    logger.info(`Backup created: ${folderName}`);
    return folderName;
  } catch (err) {
    fs.rmSync(backupFolder, { recursive: true, force: true }); // no empty leftovers
    throw err;
  }
};

exports.listBackups = () => {
  if (!fs.existsSync(BACKUPS_DIR)) return [];
  return fs.readdirSync(BACKUPS_DIR).filter(d => d.startsWith('backup-')).sort();
};

exports.restoreDB = async (folderName) => {
  // whitelist: only existing backup folders are accepted
  if (!exports.listBackups().includes(folderName)) {
    throw new AppError('Backup not found', 404);
  }

  await run('mongorestore', [
    `--uri=${process.env.DB_BASE_URI}`,
    '--gzip',
    '--drop',
    `--nsInclude=${process.env.DB_NAME}.*`,
    path.join(BACKUPS_DIR, folderName),
  ]);
  logger.info(`Restore completed from: ${folderName}`);
};