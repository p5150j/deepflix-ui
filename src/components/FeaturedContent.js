import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPlay, FiInfo } from 'react-icons/fi';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import VideoModal from './VideoModal';

const FeaturedContainer = styled.div`
  position: relative;
  height: 80vh;
  width: 100%;
  overflow: hidden;
  color: white;
`;

const BackgroundVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  filter: brightness(0.5);
`;

const GradientOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(to top, #141414, transparent 50%),
              linear-gradient(to right, rgba(0,0,0,0.8) 20%, transparent 50%);
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 3;
  padding: 0 4%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Category = styled.div`
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
`;

const Title = styled.h1`
  font-size: 5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
  text-shadow: 0 0 10px #00ff9d, 0 0 20px #00ff9d, 0 0 30px #00ff9d;
  color: white;
  text-transform: uppercase;
`;

const Rank = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  .rank-number {
    background-color: #00ff9d;
    color: black;
    font-weight: bold;
    padding: 3px 8px;
    border-radius: 4px;
    margin-right: 10px;
    box-shadow: 0 0 15px rgba(0, 255, 157, 0.4);
  }
`;

const Description = styled.div`
  max-width: 450px;
  font-size: 14px;
  margin-bottom: 25px;
  line-height: 1.6;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  opacity: 0.9;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Buttons = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled(motion.button)`
  padding: 10px 25px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  svg {
    width: 20px;
    height: 20px;
  }
  &.play {
    background-color: white;
    color: black;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }
  &.more-info {
    background-color: rgba(109, 109, 110, 0.7);
    color: white;
    box-shadow: 0 0 20px rgba(0, 255, 157, 0.2);
    &:hover {
      box-shadow: 0 0 30px rgba(0, 255, 157, 0.4);
    }
  }
`;

const AgeRating = styled.div`
  position: absolute;
  right: 4%;
  bottom: 35%;
  border-left: 3px solid white;
  padding-left: 10px;
  font-size: 18px;
`;

function FeaturedContent() {
  const [featured, setFeatured] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const videoRef = React.useRef(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const moviesRef = collection(db, 'movies');
        const q = query(moviesRef, where('featured', '==', true));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setFeatured({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        } else {
          setFeatured(null);
        }
      } catch (error) {
        console.error('Error fetching featured movie:', error);
        setFeatured(null);
      }
    };
    fetchFeatured();
  }, []);

  // Seek to 3 seconds in when video loads, and loop only 3-6s
  useEffect(() => {
    if (videoRef.current) {
      const handleLoadedMetadata = () => {
        try {
          if (videoRef.current) videoRef.current.currentTime = 3;
        } catch (e) {}
      };
      const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.currentTime >= 6) {
          videoRef.current.currentTime = 3;
        }
      };
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };
    }
  }, [featured]);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  if (!featured) {
    return (
      <FeaturedContainer>
        <GradientOverlay />
        <ContentWrapper>
          <Title>No Featured Movie</Title>
          <Description>Mark a movie as featured in the database to display it here.</Description>
        </ContentWrapper>
      </FeaturedContainer>
    );
  }

  const movieInfo = featured.story?.movie_info || {};
  const videoUrl = featured.final_video || featured.video?.video_url;

  return (
    <>
      <FeaturedContainer>
        {videoUrl && (
          <BackgroundVideo
            ref={videoRef}
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        )}
        <GradientOverlay />
        <ContentWrapper>
          <Category>
            <span style={{ color: '#00ff9d' }}>{movieInfo.genre?.toUpperCase() || 'FEATURED'}</span>
          </Category>
          <Title>{movieInfo.title || 'Untitled Movie'}</Title>
          <Rank>
            <div className="rank-number">FEATURED</div>
            <div>{movieInfo.director ? `by ${movieInfo.director}` : ''}</div>
          </Rank>
          <Description>{movieInfo.description || 'No description available.'}</Description>
          <Buttons>
            <Button 
              className="play"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openModal}
            >
              <FiPlay /> Play
            </Button>
          </Buttons>
          <AgeRating>{movieInfo.rating ? `Rated ${movieInfo.rating}` : ''}</AgeRating>
        </ContentWrapper>
      </FeaturedContainer>
      <VideoModal 
        isOpen={modalIsOpen}
        onClose={closeModal}
        videoUrl={videoUrl}
        title={movieInfo.title}
      />
    </>
  );
}

export default FeaturedContent;