import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');
const backendClientPath = path.join(__dirname, '..', 'backend', 'client'); // ⬅️ FIXED

function copyDist() {
    if (!fs.existsSync(distPath)) {
        console.error("❌ dist folder not found! Run 'npm run build' first.");
        return;
    }

    if (fs.existsSync(backendClientPath)) {
        fs.rmSync(backendClientPath, { recursive: true, force: true });
    }

    fs.mkdirSync(backendClientPath, { recursive: true });

    fs.cp(distPath, backendClientPath, { recursive: true }, (err) => {
        if (err) {
            console.error("❌ Copy Error:", err);
        } else {
            console.log("✅ dist copied to backend/client!");
        }
    });
}

copyDist();