"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const downloader_1 = require("./npm/downloader");
async function main() {
    const pkg = process.argv[2];
    console.log('Running sync:', pkg);
    await (0, downloader_1.syncPackage)(pkg);
}
main();
