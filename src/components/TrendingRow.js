import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import image1 from '../images/scene_0001_b-roll_00001_.png';
import image2 from '../images/scene_0008_character_00001_.png';
import image3 from '../images/scene_0013_b-roll_00001_.png';
import image4 from '../images/scene_0017_b-roll_00001_.png';
import image5 from '../images/scene_0026_b-roll_00001_.png';
import image6 from '../images/scene_0054_b-roll_00001_.png';
import VideoModal from './VideoModal';

const RowContainer = styled.div`
  padding: 20px 4%;
  color: white;
`;

const Title = styled.h2`
  font-size: 1.4vw;
  font-weight: bold;
  margin-bottom: 15px;
`;

const ItemsContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding: 10px 0;
  scrollbar-width: none; /* Firefox */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

const Item = styled(motion.div)`
  flex: 0 0 auto;
  width: 230px;
  height: 130px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background-color: #2f2f2f;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .netflix-logo {
    position: absolute;
    top: 5px;
    left: 5px;
    width: 20px;
    height: 20px;
    color: #00ff9d; /* Neon green */
    text-shadow: 0 0 5px #00ff9d;
  }
`;

// Sample video URL - this would come from Firebase in a real app
const sampleVideoUrl = process.env.REACT_APP_SAMPLE_VIDEO_URL;

// Sample data for trending shows
const trendingData = [
  { id: 1, title: "Action Movie", imageUrl: image1, videoUrl: sampleVideoUrl },
  { id: 2, title: "Drama Series", imageUrl: image2, videoUrl: sampleVideoUrl },
  { id: 3, title: "Comedy Special", imageUrl: image3, videoUrl: sampleVideoUrl },
  { id: 4, title: "Documentary", imageUrl: image4, videoUrl: sampleVideoUrl },
  { id: 5, title: "Sci-Fi Adventure", imageUrl: image5, videoUrl: sampleVideoUrl },
  { id: 6, title: "Romantic Comedy", imageUrl: image6, videoUrl: sampleVideoUrl },
  { id: 7, title: "Horror Film", imageUrl: image1, videoUrl: sampleVideoUrl },
  { id: 8, title: "Animated Feature", imageUrl: image2, videoUrl: sampleVideoUrl }
];

function TrendingRow({ title }) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState({
    url: "",
    title: ""
  });

  const openModal = (item) => {
    setSelectedVideo({
      url: item.videoUrl,
      title: item.title
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <RowContainer>
      <Title>{title}</Title>
      <ItemsContainer>
        {trendingData.map(item => (
          <Item 
            key={item.id}
            whileHover={{ 
              scale: 1.1,
              zIndex: 10,
              transition: { duration: 0.2 }
            }}
            onClick={() => openModal(item)}
          >
            <img src={item.imageUrl} alt={item.title} />
            <div className="netflix-logo">D</div>
          </Item>
        ))}
      </ItemsContainer>

      <VideoModal 
        isOpen={modalIsOpen}
        onClose={closeModal}
        videoUrl={selectedVideo.url}
        videoDetails={selectedVideo}
      />
    </RowContainer>
  );
}

export default TrendingRow;