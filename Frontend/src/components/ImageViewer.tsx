import React, { useState } from 'react';
import { Box, ImageList, ImageListItem, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ImageViewerProps {
  images: string[];
}

const ImageViewer: React.FC<ImageViewerProps> = ({ images }) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const API_BASE_URL = 'http://localhost:8000';



  const handleImageClick = (image: string) => {
    setSelectedImage(getFullImageUrl(image));
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  if (!images || images.length === 0) {
    return null;
  }

  const getFullImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  return (
    <>
      <ImageList cols={images.length > 1 ? 2 : 1} gap={8} sx={{ mt: 1 }}>
        {images.map((image, index) => (
          <ImageListItem key={index} onClick={() => handleImageClick(image)} sx={{ cursor: 'pointer' }}>
            <img
              src={getFullImageUrl(image)}
              alt={`PDF content ${index + 1}`}
              loading="lazy"
              style={{ borderRadius: '4px', maxHeight: '200px', objectFit: 'contain' }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="image-modal"
        aria-describedby="enlarged-image-from-pdf"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90vw',
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 1,
          borderRadius: 1,
        }}>
          <IconButton 
            onClick={handleCloseModal}
            sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={selectedImage}
            alt="Enlarged view"
            style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', display: 'block' }}
          />
        </Box>
      </Modal>
    </>
  );
};

export default ImageViewer;





