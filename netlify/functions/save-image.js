const fs = require('fs');
const path = require('path');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  let imageData;
  try {
    const body = JSON.parse(event.body);
    imageData = body.imageData;
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No se recibió imagen' })
    };
  }

  if (!imageData) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No se recibió imagen' })
    };
  }

  const fileName = `img_${Date.now()}.png`;
  const imagesDir = path.join(__dirname, '../../public/images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const base64Data = imageData.replace(/^data:image\/(png|bmp|jpeg);base64,/, '');
  const filePath = path.join(imagesDir, fileName);

  try {
    fs.writeFileSync(filePath, base64Data, 'base64');
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, fileName })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al guardar la imagen' })
    };
  }
};
