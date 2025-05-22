import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FiPlay, FiEdit, FiEye, FiEyeOff, FiLoader, FiClock, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import VideoModal from '../components/VideoModal';

const Container = styled.div`
  min-height: 100vh;
  background: #000;
  color: white;
  padding: 60px 4%;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 30px;
  color: #fff;
  text-shadow: 0 0 20px #00ff9d, 0 0 40px #00ff9d;
`;

const MoviesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 30px;
  margin-top: 40px;
`;

const MovieCard = styled(motion.div)`
  background: rgba(20, 20, 20, 0.4);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 157, 0.2);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const MovieImage = styled.div`
  width: 100%;
  height: 250px;
  position: relative;
  cursor: pointer;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  &:hover .play-overlay {
    opacity: 1;
  }

  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;

    svg {
      font-size: 3rem;
      color: #00ff9d;
      filter: drop-shadow(0 0 10px rgba(0, 255, 157, 0.5));
    }
  }
`;

const MovieContent = styled.div`
  padding: 25px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const MovieTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #fff;
`;

const MovieDescription = styled.p`
  font-size: 0.95rem;
  color: #aaa;
  margin-bottom: 20px;
  line-height: 1.6;
  flex-grow: 1;
`;

const MovieMetadata = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: #888;
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  
  .label {
    color: #666;
    margin-right: 4px;
  }
  
  .value {
    color: #aaa;
  }
`;

const MovieStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: ${props => props.published ? '#00ff9d' : '#666'};
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.published ? '#00ff9d' : '#666'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  background: ${props => 
    props.primary ? '#00ff9d' : 
    props.danger ? '#ff4444' : 
    'rgba(30, 30, 30, 0.6)'};
  color: ${props => 
    props.primary || props.danger ? 'black' : 
    '#00ff9d'};
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  color: #00ff9d;
  background: rgba(0, 255, 157, 0.1);
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QueueStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: ${props => {
    switch(props.status) {
      case 'queued': return '#ffd700';
      case 'processing': return '#00ff9d';
      case 'completed': return '#00ff9d';
      case 'failed': return '#ff4444';
      default: return '#666';
    }
  }};
`;

const QueueProgress = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: #00ff9d;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const QueuePosition = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: #ffd700;
  margin-top: 5px;
`;

const StatusText = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const DeleteButton = styled(Button)`
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
  
  &:hover {
    background: rgba(255, 68, 68, 0.2);
  }
`;

const ImageLoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ff9d;
`;

const GenreRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const GenreLabel = styled.span`
  color: #888;
  font-size: 0.92em;
  font-weight: 500;
  letter-spacing: 0.2px;
`;

const GenreBadge = styled.span`
  display: inline-block;
  background: #00ff9d;
  color: #111;
  font-weight: 700;
  font-size: 0.82rem;
  border-radius: 10px;
  padding: 2px 10px;
  box-shadow: 0 0 6px #00ff9d33;
  letter-spacing: 0.3px;
`;

const STAGES = [
  { key: 'story', label: 'Story' },
  { key: 'images', label: 'Base Visuals' },
  { key: 'video', label: 'Video/Auido' },
];
const HYPE_MESSAGES = [
  "Popcorn ready? Your movie is coming!",
  "The AI directors are working overtime...",
  "Your blockbuster is almost here...",
  "Building your cinematic universe...",
  "Rendering neon dreams..."
];

function MyMovies() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Real-time listener for movies
    const moviesRef = collection(db, 'movies');
    const q = query(
      moviesRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const moviesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMovies(moviesData);
      setLoading(false);
    }, (error) => {
      console.error('Error in real-time listener:', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleImageLoad = (movieId) => {
    setLoadingImages(prev => ({
      ...prev,
      [movieId]: false
    }));
  };

  const handleImageError = (movieId) => {
    setLoadingImages(prev => ({
      ...prev,
      [movieId]: false
    }));
  };

  const togglePublish = async (movieId, currentStatus) => {
    setUpdating(movieId);
    try {
      const movieRef = doc(db, 'movies', movieId);
      await updateDoc(movieRef, {
        isPublished: !currentStatus,
        updatedAt: new Date()
      });
      
      setMovies(prevMovies => 
        prevMovies.map(movie => 
          movie.id === movieId 
            ? { ...movie, isPublished: !currentStatus }
            : movie
        )
      );
    } catch (error) {
      console.error('Error updating movie:', error);
    } finally {
      setUpdating(null);
    }
  };

  const openVideoModal = (movie) => {
    setSelectedMovie(movie);
    setIsVideoModalOpen(true);
    setIsVideoLoading(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedMovie(null);
    setIsVideoLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getQueueStatus = (movie) => {
    // Use top-level status, fallback to progress.video for more granularity
    const status = movie.status || movie.progress?.video || 'unknown';
    let progress = 0;
    if (status === 'completed') progress = 100;
    else if (status === 'processing') progress = 50;
    else if (status === 'queued') progress = 0;
    return {
      status,
      progress,
      position: movie.queue_position
    };
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'queued': return 'In Queue';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const handleDelete = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
      return;
    }

    setDeleting(movieId);
    try {
      const movieRef = doc(db, 'movies', movieId);
      await deleteDoc(movieRef);
      
      setMovies(prevMovies => 
        prevMovies.filter(movie => movie.id !== movieId)
      );
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Failed to delete movie. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>
          <FiLoader className="spin" />
          Loading your movies...
        </LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>My Movies</Title>
      
      {movies.length === 0 ? (
        <p>You haven't created any movies yet.</p>
      ) : (
        <>
          <MoviesGrid>
            {movies.map((movie, idx) => {
              console.log(movie); // Debug: log the movie object structure
              const queueStatus = getQueueStatus(movie);
              
              return (
                <MovieCard
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MovieImage onClick={() => openVideoModal(movie)}>
                    {(!movie.images?.image_urls?.[0] || loadingImages[movie.id] !== false) && (
                      <ImageLoadingOverlay>
                        <NeonSpinner />
                      </ImageLoadingOverlay>
                    )}
                    {movie.images?.image_urls?.[0] && (
                      <img 
                        src={movie.images.image_urls[0]} 
                        alt={movie.story?.movie_info?.title || 'Movie thumbnail'}
                        style={{ display: loadingImages[movie.id] === false ? 'block' : 'none' }}
                        onLoad={() => handleImageLoad(movie.id)}
                        onError={() => handleImageError(movie.id)}
                      />
                    )}
                    <div className="play-overlay">
                      <FiPlay />
                    </div>
                  </MovieImage>
                  <MovieContent>
                    <MovieTitle>{movie.story?.movie_info?.title || 'Untitled Movie'}</MovieTitle>
                    <MovieDescription>{movie.story?.movie_info?.description || 'No description available.'}</MovieDescription>
                    
                    <div style={{ margin: '18px 0 10px 0' }}>
                      {(queueStatus.status === 'queued' || queueStatus.status === 'processing') && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: queueStatus.status === 'queued' ? '#ffd700' : '#00ff9d', fontWeight: 600, fontSize: '1.05em', marginBottom: 8 }}>
                          {queueStatus.status === 'processing' && <FiLoader className="spin" style={{ fontSize: 18 }} />}
                          {queueStatus.status === 'queued' && <FiClock style={{ fontSize: 18 }} />}
                          <span>{getStatusText(queueStatus.status)}</span>
                        </div>
                      )}
                      {movie.status !== 'completed' && (
                        <>
                          <StageProgressBar progress={movie.progress} status={movie.status} />
                          <StageLabels progress={movie.progress} />
                        </>
                      )}
                      {(movie.status === 'queued' || movie.status === 'processing') && (
                        <div style={{ color: '#00ff9d', fontSize: '0.98em', marginTop: 8, minHeight: 22 }}>
                          {HYPE_MESSAGES[Math.floor((Date.now()/4000 + idx) % HYPE_MESSAGES.length)]}
                        </div>
                      )}
                    </div>

                    <GenreRow>
                      {(movie.story?.movie_info?.genre || movie.genre) && (
                        <>
                          <GenreLabel>Genre:</GenreLabel>
                          <GenreBadge>
                            {movie.story?.movie_info?.genre || movie.genre}
                          </GenreBadge>
                        </>
                      )}
                      <span style={{ color: '#888', fontSize: '0.92em', marginLeft: 'auto' }}>
                        Created: {formatDate(movie.createdAt)}
                      </span>
                    </GenreRow>

                    {queueStatus.status === 'completed' && (
                      <>
                        <MovieStatus published={movie.isPublished}>
                          <StatusDot published={movie.isPublished} />
                          {movie.isPublished ? 'Published' : 'Unpublished'}
                        </MovieStatus>
                        <ButtonGroup>
                          <Button
                            primary
                            onClick={() => togglePublish(movie.id, movie.isPublished)}
                            disabled={updating === movie.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {movie.isPublished ? <FiEyeOff /> : <FiEye />}
                            {movie.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                          <DeleteButton
                            onClick={() => handleDelete(movie.id)}
                            disabled={deleting === movie.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FiTrash2 />
                            {deleting === movie.id ? 'Deleting...' : 'Delete'}
                          </DeleteButton>
                        </ButtonGroup>
                      </>
                    )}
                  </MovieContent>
                </MovieCard>
              );
            })}
          </MoviesGrid>
        </>
      )}

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={closeVideoModal}
        videoUrl={selectedMovie?.final_video || selectedMovie?.video?.video_url}
        title={selectedMovie?.story?.movie_info?.title}
        isLoading={isVideoLoading}
        onLoad={() => setIsVideoLoading(false)}
      />
    </Container>
  );
}

function StageProgressBar({ progress, status }) {
  // Determine which stage is currently active if none are 'processing'
  let foundProcessing = false;
  let firstPendingIdx = -1;
  if (progress) {
    for (let i = 0; i < STAGES.length; i++) {
      if (progress[STAGES[i].key] === 'processing') {
        foundProcessing = true;
        break;
      }
      if (firstPendingIdx === -1 && progress[STAGES[i].key] !== 'completed') {
        firstPendingIdx = i;
      }
    }
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {STAGES.map((stage, i) => {
        let state = 'pending';
        let isCurrent = false;
        if (progress) {
          if (progress[stage.key] === 'completed') state = 'completed';
          else if (progress[stage.key] === 'processing') { state = 'processing'; isCurrent = true; }
          else if (!foundProcessing && firstPendingIdx === i) { state = 'processing'; isCurrent = true; }
        }
        if (status === 'failed') state = 'failed';
        let bg = '#222', glow = '';
        if (state === 'completed') bg = '#00ff9d';
        if (isCurrent) { bg = '#ffd700'; glow = '0 0 12px #ffd700, 0 0 24px #ffd70055'; }
        if (state === 'failed') bg = '#ff4444';
        return (
          <div key={stage.key} style={{
            flex: 1,
            height: 8,
            borderRadius: 6,
            background: bg,
            marginRight: i < STAGES.length-1 ? 6 : 0,
            boxShadow: glow,
            transition: 'background 0.3s, box-shadow 0.3s'
          }} />
        );
      })}
    </div>
  );
}

function StageLabels({ progress }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.92em', color: '#bdbdbd' }}>
      {STAGES.map(stage => (
        <span key={stage.key}>{stage.label}</span>
      ))}
    </div>
  );
}

function NeonSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: '3px solid #222',
        borderTop: '3px solid #00ff9d',
        boxShadow: '0 0 16px #00ff9d99',
        margin: '0 auto',
        display: 'block',
      }}
    />
  );
}

export default MyMovies; 