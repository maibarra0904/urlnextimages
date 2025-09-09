import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  if (!fs.existsSync(imagesDir)) {
    return res.status(200).json({ images: [] });
  }
  const files = fs.readdirSync(imagesDir).filter(f => f.match(/^img_.*\.(png|bmp|jpeg)$/));
  res.status(200).json({ images: files });
}
