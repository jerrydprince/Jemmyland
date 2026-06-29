import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicImagesDir = path.join(__dirname, 'public', 'Images');

async function compressImages() {
  console.log('Starting image compression...');
  try {
    const files = fs.readdirSync(publicImagesDir);
    
    for (const file of files) {
      if (file.toLowerCase().endsWith('.png')) {
        const filePath = path.join(publicImagesDir, file);
        const stat = fs.statSync(filePath);
        
        // Only compress if larger than 300KB
        if (stat.size > 300 * 1024) {
          console.log(`Compressing ${file} (Original Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB)...`);
          const tempPath = path.join(publicImagesDir, `temp_${file}`);
          
          await sharp(filePath)
            .resize({ width: 1920, withoutEnlargement: true })
            .png({ quality: 60, compressionLevel: 9, effort: 10 })
            .toFile(tempPath);
            
          fs.renameSync(tempPath, filePath);
          
          const newStat = fs.statSync(filePath);
          console.log(`Finished ${file} (New Size: ${(newStat.size / 1024 / 1024).toFixed(2)} MB)`);
        }
      }
    }
    console.log('Done compressing images!');
  } catch (error) {
    console.error('Error compressing images:', error);
  }
}

compressImages();
