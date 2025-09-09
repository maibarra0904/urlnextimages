const fs = require('fs');
const path = require('path');

exports.handler = async function(event) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }
  const imagesDir = path.join(__dirname, '../../public/images');
  if (!fs.existsSync(imagesDir)) {
    return {
      statusCode: 200,
      body: JSON.stringify({ images: [] })
    };
  }
  const files = fs.readdirSync(imagesDir).filter(f => f.match(/^img_.*\.(png|bmp|jpeg)$/));
  return {
    statusCode: 200,
    body: JSON.stringify({ images: files })
  };
};
