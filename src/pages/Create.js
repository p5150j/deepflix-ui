import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { FiPlay, FiInfo, FiLoader } from 'react-icons/fi';
import image1 from '../images/scene_0001_b-roll_00001_.png';
import image2 from '../images/scene_0008_character_00001_.png';
import image3 from '../images/scene_0013_b-roll_00001_.png';
import image4 from '../images/scene_0017_b-roll_00001_.png';
import image5 from '../images/scene_0026_b-roll_00001_.png';
import image6 from '../images/scene_0054_b-roll_00001_.png';
import { useAuth } from '../AuthContext';

const backgroundImages = [image1, image2, image3, image4, image5, image6];

const queueApiUrl = process.env.REACT_APP_QUEUE_API_URL || 'http://localhost:3006';

const CreateContainer = styled.div`
  min-height: 100vh;
  background: #000;
  color: white;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const BackgroundWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
`;

const BackgroundImage = styled(motion.img)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: url(#ripple);
  transform-origin: center;
  will-change: opacity, transform;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 50%,
    rgba(0, 0, 0, 0.95) 100%
  );
`;

const ContentSection = styled.div`
  position: relative;
  z-index: 2;
  padding: 60px 4%;
  display: flex;
  flex-direction: column;
`;

const Title = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 20px;
  color: #fff;
  text-shadow: 0 0 20px #00ff9d, 0 0 40px #00ff9d;
`;

const Subtitle = styled(motion.p)`
  font-size: 1rem;
  margin-bottom: 40px;
  color: #aaa;
  max-width: 600px;
  line-height: 1.6;
  opacity: 0.9;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
`;

const Form = styled(motion.form)`
  max-width: 700px;
  width: 100%;
 background: rgba(20, 20, 20, 0.4);
  padding: 35px;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 157, 0.2);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  @supports not (backdrop-filter: blur(20px)) {
    background: rgba(20, 20, 20, 0.95);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 30px;
`;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
`;

const Label = styled.label`
  color: #00ff9d;
  font-size: 1rem;
  font-weight: 500;
`;

const InfoIcon = styled(FiInfo)`
  color: #00ff9d;
  font-size: 16px;
  cursor: help;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const Tooltip = styled.div`
  position: relative;
  display: inline-block;

  &:hover span {
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
  }
`;

const TooltipText = styled.span`
  visibility: hidden;
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  text-align: center;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 157, 0.3);
  backdrop-filter: blur(10px);
  font-size: 0.8rem;
  line-height: 1.4;
  
  /* Position the tooltip */
  position: absolute;
  z-index: 1;
  width: 200px;
  bottom: 125%;
  left: 50%;
  margin-left: -100px;
  
  /* Fade in */
  opacity: 0;
  transition: all 0.2s;
  transform: translateY(10px);

  /* Arrow */
  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: rgba(0, 255, 157, 0.3) transparent transparent transparent;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(30, 30, 30, 0.6);
  border: 1px solid rgba(0, 255, 157, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  backdrop-filter: blur(5px);
  
  &:focus {
    outline: none;
    border-color: #00ff9d;
    box-shadow: 0 0 10px rgba(0, 255, 157, 0.2);
    background: rgba(30, 30, 30, 0.8);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  background: rgba(30, 30, 30, 0.6);
  border: 1px solid rgba(0, 255, 157, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  backdrop-filter: blur(5px);
  
  &:focus {
    outline: none;
    border-color: #00ff9d;
    box-shadow: 0 0 10px rgba(0, 255, 157, 0.2);
    background: rgba(30, 30, 30, 0.8);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  background: rgba(30, 30, 30, 0.6);
  border: 1px solid rgba(0, 255, 157, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  backdrop-filter: blur(5px);
  
  &:focus {
    outline: none;
    border-color: #00ff9d;
    box-shadow: 0 0 10px rgba(0, 255, 157, 0.2);
    background: rgba(30, 30, 30, 0.8);
  }
  
  option {
    background: #1a1a1a;
    color: white;
  }
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #00ff9d;
  color: black;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 25px;
  
  &:disabled {
    background: #333;
    color: #666;
    cursor: not-allowed;
  }
`;

const ProgressContainer = styled.div`
  margin-top: 20px;
  border: 1px solid rgba(0, 255, 157, 0.2);
  border-radius: 4px;
  overflow: hidden;
  background: rgba(20, 20, 20, 0.4);
  backdrop-filter: blur(10px);
`;

const ProgressStep = styled.div`
  padding: 15px;
  background: ${props => props.active ? 'rgba(0, 255, 157, 0.1)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 255, 157, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const StepTitle = styled.span`
  color: ${props => props.active ? '#00ff9d' : '#666'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
`;

const StatusText = styled.span`
  color: ${props => 
    props.status === 'loading' ? '#00ff9d' : 
    props.status === 'success' ? '#00ff9d' : 
    props.status === 'error' ? '#ff4444' : 
    '#666'};
`;

const SVGFilters = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      <filter id="ripple">
        <feTurbulence 
          type="turbulence" 
          baseFrequency="0.015 0.015" 
          numOctaves="3" 
          seed="2" 
          result="TURB"
        >
          <animate 
            attributeName="baseFrequency" 
            dur="30s" 
            keyTimes="0;0.25;0.5;0.75;1"
            values="0.015 0.015;0.025 0.025;0.015 0.015;0.025 0.025;0.015 0.015" 
            repeatCount="indefinite" 
          />
        </feTurbulence>
        <feDisplacementMap 
          in2="TURB" 
          in="SourceGraphic" 
          scale="25" 
          xChannelSelector="R" 
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

const ErrorMessage = styled.div`
  color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AdvancedButton = styled(motion.button)`
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background: rgba(30, 30, 30, 0.6);
  border: 1px solid rgba(0, 255, 157, 0.2);
  border-radius: 4px;
  color: #00ff9d;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(30, 30, 30, 0.8);
    border-color: #00ff9d;
  }
`;

const AdvancedSettings = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: rgba(20, 20, 20, 0.4);
  border: 1px solid rgba(0, 255, 157, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
`;

function Create() {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previousImageIndex, setPreviousImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    prompt: '',
    genre: '',
    num_sequences: 50,
    seed: 391688,
    sampler: 'euler',
    steps: 20,
    cfg_scale: 7.5
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const controls = useAnimationControls();

  // Get the current set of images to use for background
  const getCurrentImages = () => backgroundImages;

  useEffect(() => {
    const interval = setInterval(() => {
      setPreviousImageIndex(currentImageIndex);
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000);

    return () => clearInterval(interval);
  }, [currentImageIndex]);

  useEffect(() => {
    const sequence = async () => {
      await controls.start({
        scale: [1, 1.02, 1],
        transition: { 
          duration: 5,
          ease: "easeInOut",
          times: [0, 0.5, 1]
        }
      });
    };
    sequence();
  }, [currentImageIndex, controls]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'num_sequences') {
      const numValue = parseInt(value) || 0;
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const requestPayload = {
        prompt: formData.prompt,
        genre: formData.genre,
        num_sequences: formData.num_sequences,
        seed: formData.seed,
        sampler: formData.sampler,
        steps: formData.steps,
        cfg_scale: formData.cfg_scale,
        userId: user.uid
      };

      console.log('Submitting to queue:', requestPayload);

      // Submit to Queue Service
      const response = await fetch(`${queueApiUrl}/api/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit movie to queue');
      }

      const data = await response.json();
      
      if (data.success) {
        // Redirect to MyMovies page
        window.location.href = '/my-movies';
      } else {
        throw new Error(data.error || 'Failed to submit movie to queue');
      }
    } catch (error) {
      console.error('Queue submission failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreateContainer>
      <SVGFilters />
      <BackgroundWrapper>
        <AnimatePresence initial={false}>
          <BackgroundImage
            key={`prev-${previousImageIndex}`}
            src={getCurrentImages()[previousImageIndex]}
            style={{ position: 'absolute' }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.05 }}
            transition={{
              duration: 1.5,
              ease: "easeOut"
            }}
          />
          <BackgroundImage
            key={`current-${currentImageIndex}`}
            src={getCurrentImages()[currentImageIndex]}
            style={{ position: 'absolute' }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1.5,
              ease: "easeOut"
            }}
          />
        </AnimatePresence>
        <Overlay />
      </BackgroundWrapper>
      <ContentSection>
        <Title
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Whatcha' wanna watch?
        </Title>
        
        <Subtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Thanks to our captured Illuminati lizard people and their quantum biocomputers (which we've repurposed as GPUs), we can generate ANY movie your heart desires. Just don't tell the shadow government... they're still looking for their missing reptilians 🐍
        </Subtitle>
        
        <Form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <FormGroup>
            <LabelContainer>
              <Label>Quick overview</Label>
              <Tooltip>
                <InfoIcon />
                <TooltipText>
                  Describe your movie idea in detail. The more specific you are, the better the AI can understand and generate your vision. Include key plot points, character descriptions, and atmosphere.
                </TooltipText>
              </Tooltip>
            </LabelContainer>
            <TextArea 
              name="prompt" 
              value={formData.prompt}
              onChange={handleChange}
              required
              placeholder="Describe your movie idea in detail..."
            />
          </FormGroup>
          
          <FormGroup>
            <LabelContainer>
              <Label>Genre</Label>
              <Tooltip>
                <InfoIcon />
                <TooltipText>
                  Select the primary genre for your movie. This helps the AI understand the style, tone, and conventions to follow in generating your story and visuals.
                </TooltipText>
              </Tooltip>
            </LabelContainer>
            <Select 
              name="genre" 
              value={formData.genre}
              onChange={handleChange}
              required
            >
              <option value="">Select a Genre</option>
              <option value="noir">Noir</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="horror">Horror</option>
              <option value="romance">Romance</option>
              <option value="action">Action</option>
              <option value="indie">Indie</option>
              <option value="post-apocalyptic">Post-Apocalyptic</option>
              <option value="western">Western</option>
              <option value="cyberpunk">Cyberpunk</option>
              <option value="fantasy">Fantasy</option>
              <option value="superhero">Superhero</option>
              <option value="blockbuster">Blockbuster</option>
              <option value="cinematic">Default Cinematic Style</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <LabelContainer>
              <Label>Number of Sequences</Label>
              <Tooltip>
                <InfoIcon />
                <TooltipText>
                  Choose how many scenes your movie will have. More sequences mean a longer, more detailed story. Each sequence will generate unique visuals and contribute to the narrative.
                </TooltipText>
              </Tooltip>
            </LabelContainer>
            <Input 
              type="number" 
              name="num_sequences" 
              value={formData.num_sequences}
              onChange={handleChange}
              required
            />
            
            <AdvancedButton 
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
            </AdvancedButton>

            {showAdvanced && (
              <AdvancedSettings>
                <FormGroup>
                  <LabelContainer>
                    <Label>Seed</Label>
                    <Tooltip>
                      <InfoIcon />
                      <TooltipText>
                        A seed value controls the randomness of image generation. Using the same seed with the same prompt will produce similar results.
                      </TooltipText>
                    </Tooltip>
                  </LabelContainer>
                  <Input 
                    type="number" 
                    name="seed" 
                    value={formData.seed}
                    onChange={handleChange}
                  />
                </FormGroup>

                <FormGroup>
                  <LabelContainer>
                    <Label>Sampler</Label>
                    <Tooltip>
                      <InfoIcon />
                      <TooltipText>
                        The sampling method used for image generation. Different samplers can produce different styles and qualities.
                      </TooltipText>
                    </Tooltip>
                  </LabelContainer>
                  <Select 
                    name="sampler" 
                    value={formData.sampler}
                    onChange={handleChange}
                  >
                    <option value="euler">Euler</option>
                    <option value="euler_a">Euler Ancestral</option>
                    <option value="dpm2">DPM2</option>
                    <option value="dpm2_a">DPM2 Ancestral</option>
                    <option value="lms">LMS</option>
                    <option value="heun">Heun</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <LabelContainer>
                    <Label>Steps</Label>
                    <Tooltip>
                      <InfoIcon />
                      <TooltipText>
                        The number of denoising steps. More steps can lead to higher quality but take longer to generate.
                      </TooltipText>
                    </Tooltip>
                  </LabelContainer>
                  <Input 
                    type="number" 
                    name="steps" 
                    value={formData.steps}
                    onChange={handleChange}
                    min="1"
                    max="150"
                  />
                </FormGroup>

                <FormGroup>
                  <LabelContainer>
                    <Label>CFG Scale</Label>
                    <Tooltip>
                      <InfoIcon />
                      <TooltipText>
                        Controls how closely the image follows the prompt. Higher values make the image more closely match the prompt but can reduce creativity.
                      </TooltipText>
                    </Tooltip>
                  </LabelContainer>
                  <Input 
                    type="number" 
                    name="cfg_scale" 
                    value={formData.cfg_scale}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    step="0.5"
                  />
                </FormGroup>
              </AdvancedSettings>
            )}
          </FormGroup>
          
          <Button 
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? <FiLoader className="spin" /> : <FiPlay />} 
            {loading ? 'Submitting...' : 'Generate Movie'}
          </Button>

          {error && (
            <ErrorMessage>
              <FiInfo /> {error}
            </ErrorMessage>
          )}

          <ProgressContainer>
            <ProgressStep active={loading}>
              <StepTitle active={loading}>
                Submitting to Queue
              </StepTitle>
              <StatusText status={loading ? 'loading' : 'idle'}>
                {loading ? 'Submitting...' : 'Ready'}
              </StatusText>
            </ProgressStep>
          </ProgressContainer>
        </Form>
      </ContentSection>
    </CreateContainer>
  );
}

export default Create;