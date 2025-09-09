import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Log credenciales
  console.log('Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : undefined,
  });

  const { imageData } = req.body;
  console.log('imageData recibido:', imageData ? imageData.substring(0, 30) + '...' : 'undefined');
  if (!imageData) {
    console.error('No se recibió imagen');
    return res.status(400).json({ error: 'No se recibió imagen' });
  }

  try {
    // Subir imagen a Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(imageData, {
      folder: 'urlnext-images',
    });
    console.log('Respuesta Cloudinary:', uploadResponse);
    return res.status(200).json({ success: true, url: uploadResponse.secure_url });
  } catch (err) {
    console.error('Error al subir a Cloudinary:', err);
    return res.status(500).json({ error: 'Error al subir la imagen a Cloudinary', details: err.message });
  }
}
