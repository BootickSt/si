import React, { useState } from 'react';
import { usePageTracking } from '../../hooks/usePageTracking';

const ImageUpload = () => {
  usePageTracking(6); // ID для страницы "Инверсия изображения"
  const [selectedFile, setSelectedFile] = useState(null);
  const [invertedImage, setInvertedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
    setError(null);
    setInvertedImage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Пожалуйста, выберите файл сначала');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/invert-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка сервера при обработке изображения');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setInvertedImage(imageUrl);
    } catch (err) {
      setError('Ошибка обработки изображения: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-upload-container">
      <h1>Инверсия изображения</h1>
      <p>Загрузка на сервер: http://localhost:8000/invert-image</p>
      
      <div className="upload-controls">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
        />
        
        <button 
          onClick={handleUpload} 
          disabled={!selectedFile || loading}
          className="upload-button"
        >
          {loading ? 'Обработка...' : 'Инвертировать изображение'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="images-container">
        {selectedFile && (
          <div className="image-preview">
            <h3>Исходное изображение</h3>
            <img 
              src={URL.createObjectURL(selectedFile)} 
              alt="Original" 
              className="preview-image"
            />
          </div>
        )}

        {invertedImage && (
          <div className="image-preview">
            <h3>Инвертированное изображение</h3>
            <img 
              src={invertedImage} 
              alt="Inverted" 
              className="preview-image"
            />
            <a 
              href={invertedImage} 
              download="inverted_image.jpg"
              className="download-button"
            >
              Скачать
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
