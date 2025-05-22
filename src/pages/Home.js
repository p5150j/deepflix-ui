import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import ThreeJSAnimation from '../components/ThreeJSAnimation';
import { useAuth } from '../AuthContext';
import { FcGoogle } from 'react-icons/fc';

// All home page components in one file as requested
// We can break them out later

const HomeContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #000;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
`;

const BackgroundVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  filter: brightness(0.4);
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  width: 100%;
  min-height: 100vh;
  padding: 0 4%;
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 40px;
  max-width: 600px;
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const ThreeJSPlaceholder = styled.div`
  width: 100%;
  height: 600px;
  position: relative;
  border-radius: 20px;
  display: flex;
  align-items: center;

  justify-content: center;
  overflow: hidden;
  
//   &::before {
//     content: '';
//     position: absolute;
//     top: -50%;
//     left: -50%;
//     width: 200%;
//     height: 200%;
//     background: linear-gradient(
//       to bottom right, 
//       transparent, 
//       #00ff9d44, 
//       transparent
//     );
    // animation: rotate 20s linear infinite;
  }
  
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ThreeJSContent = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
`;

const MainTitle = styled(motion.h1)`
  font-size: 5rem;
  font-weight: 900;
  margin-bottom: 20px;
  font-family: 'Arial Black', sans-serif;
  letter-spacing: 2px;
  text-shadow: 0 0 10px #00ff9d, 0 0 20px #00ff9d, 0 0 30px #00ff9d;
  color: white;
`;

const Tagline = styled(motion.p)`
  font-size: 1.6rem;
  margin-bottom: 30px;
  color: white;
  line-height: 1.5;
  font-weight: 300;
  max-width: 550px;
`;

const Paragraph = styled(motion.p)`
  font-size: 0.95rem;
  margin-bottom: 40px;
  color: #aaa;
  line-height: 1.6;
  opacity: 0.9;

  p + p {
    margin-top: 15px;
  }
`;

const CTAButton = styled(motion.button)`
  padding: 14px 30px;
  border-radius: 50px;
  background-color: #00ff9d;
  color: black;
  font-size: 18px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  max-width: 300px;
  box-shadow: 0 0 20px rgba(0, 255, 157, 0.5);
  
  &:hover {
    box-shadow: 0 0 30px rgba(0, 255, 157, 0.8);
  }
`;

const MarketingStats = styled(motion.div)`
  display: flex;
  gap: 30px;
  margin-top: 60px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #00ff9d;
  text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
  margin-bottom: 10px;
`;

const StatText = styled.div`
  font-size: 0.9rem;
  color: white;
  text-align: center;
`;

const Title = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 20px;
  color: #fff;
  text-shadow: 0 0 20px #00ff9d, 0 0 40px #00ff9d;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.2rem;
  margin-bottom: 40px;
  color: #aaa;
  max-width: 600px;
  line-height: 1.6;
`;

const LoginButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: white;
  color: black;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(0, 255, 157, 0.5);
  }
`;

const GoogleIcon = styled(FcGoogle)`
  font-size: 1.5rem;
`;

const FixedFooter = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  font-size: 0.85rem;
  color: #aaa;
  opacity: 0.8;
  z-index: 10;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  
  .heart {
    color: #00ff9d;
    display: inline-block;
    margin: 0 2px;
    text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
  }
`;

// Main Home component
function Home() {
  const videoRef = useRef(null);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  // Autoplay the background video when component mounts
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay was prevented:", error);
      });
    }
  }, []);
  
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/movies');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <HomeContainer>
      {/* Background video - replace with your actual teaser video */}
      <BackgroundVideo 
        ref={videoRef} 
        autoPlay 
        muted 
        loop 
        playsInline
        src={process.env.REACT_APP_MIXKIT_VIDEO_URL}
      />
      
      <ContentWrapper>
        <LeftSection>
          <MainTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            DEEPFLIX
          </MainTitle>
          
          <Tagline
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Your imagination is the only limit. No, seriously.
          </Tagline>
          
          <Paragraph
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Tired of endless doom-scrolling through the same old streaming platforms? Yeah, we get it. They suck. 
            
            That's why we're here - explore what movies others have created and watch whatever your heart desires by making your own. 
            
            No algorithms telling you what to watch, no recycled content. Just pure, unfiltered imagination brought to life.
          </Paragraph>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <CTAButton
              onClick={handleGoogleSignIn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign in with Google <FiArrowRight />
            </CTAButton>
          </motion.div>
          
          <MarketingStats
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <StatItem>
              <StatNumber>10x</StatNumber>
              <StatText>More content than traditional streaming</StatText>
            </StatItem>
            <StatItem>
              <StatNumber>24/7</StatNumber>
              <StatText>New content generation</StatText>
            </StatItem>
            <StatItem>
              <StatNumber>100%</StatNumber>
              <StatText>Personalized to your taste</StatText>
            </StatItem>
          </MarketingStats>
        </LeftSection>
        
        <RightSection>
          <ThreeJSPlaceholder>
            <ThreeJSContent>
              {/* Replace the placeholder text with the actual ThreeJS animation */}
              <ThreeJSAnimation />
            </ThreeJSContent>
          </ThreeJSPlaceholder>
        </RightSection>
      </ContentWrapper>

      <FixedFooter>
        Made with <span className="heart">❤</span> by some weirdos that care
      </FixedFooter>
    </HomeContainer>
  );
}

export default Home;