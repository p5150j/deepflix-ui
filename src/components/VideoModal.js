import React from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';
import { FiX, FiLoader } from 'react-icons/fi';
import CustomVideoPlayer from './CustomVideoPlayer';

// Make sure to bind modal to your app element for accessibility
Modal.setAppElement('#root');

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 100;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ff9d;
  font-size: 1.2rem;
  gap: 10px;
`;

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: '#000',
    border: 'none',
    width: '100vw',
    height: '100vh',
    padding: 0,
    overflow: 'hidden',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 1000,
  }
};

const VideoModal = ({ isOpen, onClose, videoUrl, title, isLoading, onLoad }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel="Video Player Modal"
    >
      <CloseButton onClick={onClose}>
        <FiX />
      </CloseButton>
      
      {isLoading && (
        <LoadingOverlay>
          <FiLoader className="spin" />
          Loading {title || 'video'}...
        </LoadingOverlay>
      )}
      
      <CustomVideoPlayer 
        url={videoUrl} 
        onClose={onClose} 
        onLoad={onLoad}
      />
    </Modal>
  );
};

export default VideoModal;