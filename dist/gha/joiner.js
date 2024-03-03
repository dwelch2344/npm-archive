"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBatch = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = require("node:fs");
const downloader_1 = require("../npm/downloader");
async function processBatch(batchFile) {
    const filePath = node_path_1.default.join('tmp', 'jobs', batchFile);
    const raw = await node_fs_1.promises.readFile(filePath, 'utf8');
    const jobs = JSON.parse(raw);
    for (const job of jobs) {
        console.log('[start]', job.pkg);
        await (0, downloader_1.syncPackage)(job.pkg);
        console.log('[finish]', job.pkg);
    }
}
exports.processBatch = processBatch;
;
(async function () {
    if (!process.env.VITEST) {
        const file = process.argv[2];
        console.log('[processing]', file);
        await processBatch(file);
    }
})();
