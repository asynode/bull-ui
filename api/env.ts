import * as fs from "fs";
import * as path from "path";

import * as dotenv from "dotenv-safe";

const userEnvFile = path.join(__dirname, ".env");
const globalEnvFile = path.join(__dirname, ".env.example");

const envFile = fs.existsSync(userEnvFile) ? userEnvFile : globalEnvFile;

dotenv.config({
    allowEmptyValues: true,
    sample: globalEnvFile,
    path: envFile,
});
