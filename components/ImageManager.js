import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const ImageManager = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // Maneja el evento de pegar desde el portapapeles
  const handlePaste = async (event) => {
    setError('');
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        const url = URL.createObjectURL(blob);
        setImageSrc(url);
        return;
      }
    }
    setError('No se detectó ninguna imagen en el portapapeles.');
  };

  // Permite al usuario seleccionar una imagen manualmente (opcional)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageSrc(URL.createObjectURL(file));
      setError('');
    } else {
      setError('El archivo seleccionado no es una imagen.');
    }
  };

  // Detecta si está en Netlify (producción)
  const isNetlify = typeof window !== 'undefined' && window.location.hostname.endsWith('netlify.app');

  // Guarda la imagen en el backend
  const handleSave = async () => {
    if (!imageSrc) return;
    setLoading(true);
    try {
      let base64;
      if (imageSrc.startsWith('data:image')) {
        base64 = imageSrc;
      } else {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        base64 = await new Promise((resolve, reject) => {
          const reader = new window.FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      const endpoint = isNetlify ? '/.netlify/functions/save-image' : '/api/save-image';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: base64 }),
      });
      const data = await res.json();
      if (data.success) {
        setError('');
        setImageSrc(null);
        fetchImages();
      } else {
        setError(data.error || 'Error al guardar la imagen');
      }
    } catch (err) {
      setError('Error al guardar la imagen');
    }
    setLoading(false);
  };

  // Obtiene la lista de imágenes guardadas
  const fetchImages = async () => {
    try {
      const endpoint = isNetlify ? '/.netlify/functions/list-images' : '/api/list-images';
      const res = await fetch(endpoint);
      const data = await res.json();
      setImages(data.images || []);
    } catch {
      setImages([]);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div
      tabIndex={0}
      onPaste={handlePaste}
      style={{ border: '2px dashed #888', padding: 24, borderRadius: 8, minHeight: 200 }}
    >
      <h2>Gestor de Imágenes</h2>
      <p>Pega una imagen desde el portapapeles (Ctrl+V) aquí.</p>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button onClick={() => fileInputRef.current.click()} style={{ marginBottom: 12 }}>
        Seleccionar imagen manualmente
      </button>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {imageSrc ? (
        <div>
          <div style={{ position: 'relative', width: '100%', maxWidth: 300, height: 300 }}>
            <Image
              src={imageSrc}
              alt="Imagen pegada"
              layout="fill"
              objectFit="contain"
              style={{ borderRadius: 8, border: '1px solid #ccc' }}
              unoptimized
            />
          </div>
          <br />
          <button onClick={handleSave} style={{ marginTop: 12 }} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar imagen'}
          </button>
        </div>
      ) : (
        <div style={{ color: '#666', marginTop: 24 }}>
          No hay imagen pegada o seleccionada.
        </div>
      )}
      <hr style={{ margin: '32px 0' }} />
      <h3>Imágenes guardadas</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {images.length === 0 && <span style={{ color: '#888' }}>No hay imágenes guardadas.</span>}
        {images.map((img) => (
          <div key={img} style={{ position: 'relative', width: 120, height: 120 }}>
            <Image
              src={`/images/${img}`}
              alt={img}
              layout="fill"
              objectFit="cover"
              style={{ borderRadius: 8, border: '1px solid #ccc' }}
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageManager;
