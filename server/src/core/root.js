import path from 'path';
import {fileURLToPath, pathToFileURL} from 'url';

import dotenv from 'dotenv';
import {glob} from 'glob';

dotenv.config({override: true, quiet: true});

export const rootPath = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, "../../");
}

export async function importAll(folder) {
    const routeFiles = await glob(folder);
    for (const file of routeFiles) {
        const absolutePath = path.resolve(file);
        const fileUrl = pathToFileURL(absolutePath);
        await import(fileUrl);
    }
}