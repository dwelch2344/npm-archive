"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitJobs = void 0;
const execa_1 = __importDefault(require("execa"));
const node_path_1 = __importDefault(require("node:path"));
const lodash_1 = require("lodash");
const node_fs_1 = require("node:fs");
async function splitJobs() {
    const rootRaw = await node_fs_1.promises.readFile(node_path_1.default.join('config', 'matrix.json'), 'utf8');
    const root = JSON.parse(rootRaw);
    const all = root.include;
    const len = all.length;
    const chunks = (0, lodash_1.chunk)(all, 256);
    const chunkFile = (idx) => `batch_${idx + 1}.json`;
    await (0, execa_1.default)('mkdir', ['-p', node_path_1.default.join('tmp', 'jobs')]);
    await Promise.all(chunks.map((chunk, idx) => node_fs_1.promises.writeFile(node_path_1.default.join('tmp', 'jobs', chunkFile(idx)), JSON.stringify(chunk, null, 2), 'utf8')));
    const matrix = { include: chunks.map((_, idx) => ({ file: chunkFile(idx) })) };
    console.log(JSON.stringify(matrix));
}
exports.splitJobs = splitJobs;
