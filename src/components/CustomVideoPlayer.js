import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import styled from 'styled-components';
import { FiPlay, FiPause, FiRotateCcw, FiRotateCw, FiVolume2, FiVolumeX } from 'react-icons/fi';

const PlayerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ControlsOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 20%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  opacity: ${props => (props.isControlsVisible ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
  z-index: 10;
`;

const ControlsContainer = styled.div`
  padding: 0 20px 20px;
  width: 100%;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 5px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2.5px;
  margin-bottom: 15px;
  cursor: pointer;
  position: relative;
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: #00ff9d; /* Neon green */
  border-radius: 2.5px;
  width: ${props => props.progress}%;
`;

const ProgressKnob = styled.div`
  position: absolute;
  width: 15px;
  height: 15px;
  background-color: #00ff9d; /* Neon green */
  border-radius: 50%;
  top: -5px;
  left: ${props => props.progress}%;
  transform: translateX(-50%);
  display: ${props => (props.isVisible ? 'block' : 'none')};
  box-shadow: 0 0 10px rgba(0, 255, 157, 0.7); /* Neon glow */
`;

const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const LeftControls = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  color: white;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;

  &:hover {
    color: #00ff9d; /* Neon green */
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const PlayPauseButton = styled(ControlButton)`
  font-size: 28px;
  
  svg {
    width: 28px;
    height: 28px;
  }
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const VolumeSlider = styled.input`
  -webkit-appearance: none;
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #00ff9d; /* Neon green */
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #00ff9d; /* Neon green */
    cursor: pointer;
    border: none;
  }
`;

const TimeDisplay = styled.div`
  margin-left: 15px;
  font-size: 14px;
`;

const CustomVideoPlayer = ({ url, onClose }) => {
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isProgressHovered, setIsProgressHovered] = useState(false);
  
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Handle mouse movement to show/hide controls
  const handleMouseMove = () => {
    setIsControlsVisible(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) {
        setIsControlsVisible(false);
      }
    }, 3000);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
    setMuted(false);
  };

  const handleToggleMute = () => {
    setMuted(!muted);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (e) => {
    const newPlayed = parseFloat(e.target.value);
    setPlayed(newPlayed);
  };

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    playerRef.current.seekTo(parseFloat(e.target.value));
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleRewind = () => {
    const newTime = Math.max(0, playerRef.current.getCurrentTime() - 10);
    playerRef.current.seekTo(newTime);
  };

  const handleForward = () => {
    const newTime = Math.min(duration, playerRef.current.getCurrentTime() + 10);
    playerRef.current.seekTo(newTime);
  };

  const handleProgressBarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    playerRef.current.seekTo(pos);
  };

  return (
    <PlayerContainer 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setIsControlsVisible(false)}
    >
      <VideoWrapper>
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          muted={muted}
          onProgress={handleProgress}
          onDuration={handleDuration}
          progressInterval={100}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </VideoWrapper>
      
      <ControlsOverlay isControlsVisible={isControlsVisible}>
        <ControlsContainer>
          <ProgressBarContainer 
            onClick={handleProgressBarClick}
            onMouseEnter={() => setIsProgressHovered(true)}
            onMouseLeave={() => setIsProgressHovered(false)}
          >
            <ProgressBar progress={played * 100} />
            <ProgressKnob progress={played * 100} isVisible={isProgressHovered || seeking} />
          </ProgressBarContainer>
          
          <ButtonsRow>
            <LeftControls>
              <PlayPauseButton onClick={handlePlayPause}>
                {playing ? <FiPause /> : <FiPlay />}
              </PlayPauseButton>
              
              <ControlButton onClick={handleRewind}>
                <FiRotateCcw />
              </ControlButton>
              
              <ControlButton onClick={handleForward}>
                <FiRotateCw />
              </ControlButton>
              
              <VolumeContainer>
                <ControlButton onClick={handleToggleMute}>
                  {muted || volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
                </ControlButton>
                <VolumeSlider
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                />
              </VolumeContainer>
            </LeftControls>
            
            <RightControls>
              <TimeDisplay>
                {formatTime(played * duration)} / {formatTime(duration)}
              </TimeDisplay>
            </RightControls>
          </ButtonsRow>
        </ControlsContainer>
      </ControlsOverlay>
    </PlayerContainer>
  );
};

export default CustomVideoPlayer;