"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blah = exports.syncPackage = exports.getVersionsLastWeek = exports.getManifest = void 0;
process.env.TZ = 'UTC';
const node_fetch_commonjs_1 = __importDefault(require("node-fetch-commonjs"));
const date_fns_1 = require("date-fns");
// import { format, utcToZonedTime } from "date-fns-tz";
const node_path_1 = __importDefault(require("node:path"));
const execa_1 = __importDefault(require("execa"));
const node_fs_1 = require("node:fs");
async function getManifest(pkg) {
    const req = await (0, node_fetch_commonjs_1.default)(`https://registry.npmjs.com/${encode(pkg)}`);
    const body = await req.json();
    return body;
}
exports.getManifest = getManifest;
async function getVersionsLastWeek(pkg) {
    const encoded = encode(pkg);
    const result = await (0, node_fetch_commonjs_1.default)(`https://api.npmjs.org/versions/${encoded}/last-week`);
    const body = await result.json();
    body.end = new Date();
    body.start = (0, date_fns_1.subDays)(body.end, 7);
    return body;
}
exports.getVersionsLastWeek = getVersionsLastWeek;
async function getYearlies(pkg) {
    const encoded = encode(pkg);
    const now = new Date();
    const fya = (0, date_fns_1.subYears)(now, 1);
    const startOfFYA = (0, date_fns_1.startOfYear)(fya);
    const interval = {
        start: startOfFYA,
        end: now,
    };
    const months = (0, date_fns_1.eachMonthOfInterval)(interval);
    const targets = months.map(start => ({
        start: (0, date_fns_1.formatDate)(start, 'yyyy-MM-dd'),
        end: (0, date_fns_1.formatDate)((0, date_fns_1.endOfMonth)(start), 'yyyy-MM-dd')
    }));
    const results = await Promise.all(targets.map(t => (0, node_fetch_commonjs_1.default)(`https://api.npmjs.org/downloads/range/${t.start}:${t.end}/jquery`)
        .then(res => res.json())
        .then(stats => ({
        ...stats,
        month: stats.start.substring(0, 7)
    }))));
    return results;
}
async function syncPackage(pkg) {
    const encoded = encode(pkg);
    const basePath = node_path_1.default.join('data', 'npm', encoded, '');
    await (0, execa_1.default)('mkdir', ['-p', node_path_1.default.join(basePath, 'stats')]);
    await (0, execa_1.default)('mkdir', ['-p', node_path_1.default.join(basePath, 'historical')]);
    const now = new Date();
    const ts = (0, date_fns_1.formatDate)(now, 'yyyy-MM-dd_hh-mm-ss');
    const [manifest, weekly, yearlies] = await Promise.all([
        getManifest(pkg),
        getVersionsLastWeek(pkg),
        getYearlies(pkg)
    ]);
    await Promise.all([
        node_fs_1.promises.writeFile(node_path_1.default.join(basePath, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8'),
        node_fs_1.promises.writeFile(node_path_1.default.join(basePath, 'stats', ts + '.json'), JSON.stringify(weekly, null, 2), 'utf8'),
        ...yearlies.map(y => node_fs_1.promises.writeFile(node_path_1.default.join(basePath, 'historical', y.month + '.json'), JSON.stringify(y, null, 2), 'utf8'))
    ]);
}
exports.syncPackage = syncPackage;
async function blah() {
    // console.log(format(utcToZonedTime(new Date(), 'UTC'), 
    //   'yyyy-MM-dd', 
    //   { timeZone: 'UTC' }
    // ))
}
exports.blah = blah;
function encode(pkg) {
    return pkg?.replaceAll('/', '%2F');
}
function decode(pkg) {
    return pkg?.replaceAll('%2F', '/');
}
