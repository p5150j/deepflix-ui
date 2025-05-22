import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import VideoModal from '../components/VideoModal';
import Modal from 'react-modal';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FiPlay } from 'react-icons/fi';

// Set modal app element for accessibility
Modal.setAppElement('#root');

const MoviesContainer = styled.div`
  padding: 20px 0;
`;

const CategoryRow = styled.div`
  padding: 20px 4%;
  color: white;
`;

const RowTitle = styled.h2`
  font-size: 1.4vw;
  font-weight: bold;
  margin-bottom: 15px;
`;

const ItemsRow = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding: 10px 0;
  scrollbar-width: none; /* Firefox */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

const MovieItem = styled(motion.div)`
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

const LoadingMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.2rem;
  color: #fff;

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const moviesRef = collection(db, 'movies');
        const q = query(moviesRef, where('isPublished', '==', true));
        const querySnapshot = await getDocs(q);
        
        const moviesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Group movies by genre for the categories
        const categories = {};
        moviesData.forEach(movie => {
          let genre = movie.story?.movie_info?.genre || movie.genre || 'Other';
          genre = typeof genre === 'string' ? genre.trim().toLowerCase() : 'other';
          if (!categories[genre]) {
            categories[genre] = {
              id: genre,
              title: `${genre.charAt(0).toUpperCase() + genre.slice(1)} Movies`,
              movies: []
            };
          }
          categories[genre].movies.push(movie);
        });
        
        setMovies(Object.values(categories));
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const openModal = (movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  // Modal content with framer-motion animation and rich HTML support
  const BetaModalContent = (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.98 }}
      transition={{ duration: 0.45, type: 'spring', bounce: 0.18 }}
      style={{
        textAlign: 'left',
        maxWidth: 540,
        width: '100%',
        fontSize: '1.01rem',
        lineHeight: 1.7,
        fontFamily: 'inherit',
        position: 'relative'
      }}
    >
      <h1 style={{
        color: '#00ff9d',
        fontWeight: 700,
        fontSize: '1.25rem',
        margin: 0,
        marginBottom: 18,
        letterSpacing: '0.2px'
      }}>
        Welcome to DeepFlix Beta
      </h1>
      <p style={{ color: '#bdbdbd', marginBottom: 18 }}>
        Thank you for joining our open beta. DeepFlix is an experiment in AI-generated movies and community-driven streaming. As an early user, you're helping us shape the future of this platform.
      </p>
      <p style={{ color: '#bdbdbd', marginBottom: 18 }}>
        <b>What to expect:</b>
        <ul style={{ color: '#bdbdbd', margin: '8px 0 0 18px', padding: 0, fontSize: '1.01rem' }}>
          <li>Some movies may have visual or audio artifacts—this is part of the AI process.</li>
          <li>Queue times may vary depending on demand.</li>
          <li>Features and quality will improve rapidly as we iterate.</li>
        </ul>
      </p>
      <p style={{ color: '#bdbdbd', marginBottom: 18 }}>
        DeepFlix is free during beta. Our goal is to keep it accessible and community-focused, with no corporate gatekeeping.
      </p>
      <p style={{ color: '#bdbdbd', marginBottom: 18 }}>
        <b>Curious about what's next?</b> We're actively working on new features and improvements based on your feedback. 
        Check out our <a href="/roadmap" style={{ color: '#00ff9d', textDecoration: 'underline' }}>public roadmap</a> to see what's coming and how we're tackling the known issues.
      </p>
      <motion.button
        whileHover={{ scale: 1.04, boxShadow: '0 0 12px #00ff9d' }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: '#00ff9d',
          color: '#111',
          border: 'none',
          borderRadius: '6px',
          padding: '11px 32px',
          fontWeight: 600,
          fontSize: '1.05rem',
          cursor: 'pointer',
          boxShadow: '0 0 8px #00ff9d44',
          marginTop: 10,
          marginLeft: 0
        }}
        onClick={() => setIsBetaModalOpen(false)}
      >
        Continue
      </motion.button>
    </motion.div>
  );

  if (loading) {
    return (
      <MoviesContainer>
        <Modal
          isOpen={isBetaModalOpen}
          onRequestClose={() => setIsBetaModalOpen(false)}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              background: '#111',
              color: '#fff',
              borderRadius: '12px',
              padding: '2.5rem 2.5rem',
              maxWidth: '650px',
              width: '90vw',
              textAlign: 'left',
              boxShadow: '0 0 32px #00ff9d33',
              fontSize: '1.02rem',
              lineHeight: 1.7,
              letterSpacing: '0.01em',
              border: '1.5px solid #222'
            },
            overlay: {
              backgroundColor: 'rgba(0,0,0,0.85)',
              zIndex: 1000
            }
          }}
          contentLabel="Beta Info"
        >
          {BetaModalContent}
        </Modal>
        <LoadingMessage>
          <FiPlay className="spin" />
          Loading movies...
        </LoadingMessage>
      </MoviesContainer>
    );
  }

  return (
    <MoviesContainer>
      <Modal
        isOpen={isBetaModalOpen}
        onRequestClose={() => setIsBetaModalOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            background: '#111',
            color: '#fff',
            borderRadius: '12px',
            padding: '2.5rem 2.5rem',
            maxWidth: '650px',
            width: '90vw',
            textAlign: 'left',
            boxShadow: '0 0 32px #00ff9d33',
            fontSize: '1.02rem',
            lineHeight: 1.7,
            letterSpacing: '0.01em',
            border: '1.5px solid #222'
          },
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 1000
          }
        }}
        contentLabel="Beta Info"
      >
        {BetaModalContent}
      </Modal>
      {movies.map(category => (
        <CategoryRow key={category.id}>
          <RowTitle>{category.title}</RowTitle>
          <ItemsRow>
            {category.movies.map(movie => (
              <MovieItem
                key={movie.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openModal(movie)}
              >
                <img 
                  src={movie.images?.image_urls?.[0] || 'placeholder.jpg'} 
                  alt={movie.story?.movie_info?.title || 'Movie thumbnail'} 
                />
                <div className="netflix-logo">D</div>
              </MovieItem>
            ))}
          </ItemsRow>
        </CategoryRow>
      ))}

      <VideoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        videoUrl={selectedMovie?.final_video || selectedMovie?.video?.video_url}
        title={selectedMovie?.story?.movie_info?.title}
      />
    </MoviesContainer>
  );
}

export default Movies;