import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const result = await cloudinary.search
      .expression('folder:urlnext-images')
      .sort_by('created_at','desc')
      .max_results(30)
      .execute();
    const images = result.resources.map(img => img.secure_url);
    return res.status(200).json({ images });
  } catch (err) {
    return res.status(500).json({ error: 'Error al consultar Cloudinary', details: err.message });
  }
}
