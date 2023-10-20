import path from 'path';
import {fileURLToPath} from 'url';

import dotenv from 'dotenv'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({override: true})

const dir = {root: path.join(__dirname, "../")};
dir.static = path.join(dir.root, '../../client/dist')
dir.storage = path.join(dir.root, "storage");
dir.jobs = path.join(dir.storage, "jobs")

export default {
    path: dir,
    env: process.env
};