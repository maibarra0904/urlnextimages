import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Permite imágenes grandes
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { imageData } = req.body;
  if (!imageData) {
    return res.status(400).json({ error: 'No se recibió imagen' });
  }

  // Genera un nombre único
  const fileName = `img_${Date.now()}.png`;
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Elimina el prefijo base64 si existe
  const base64Data = imageData.replace(/^data:image\/(png|bmp|jpeg);base64,/, '');
  const filePath = path.join(imagesDir, fileName);

  try {
    fs.writeFileSync(filePath, base64Data, 'base64');
    return res.status(200).json({ success: true, fileName });
  } catch (err) {
    return res.status(500).json({ error: 'Error al guardar la imagen' });
  }
}
