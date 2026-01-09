import React, { useEffect, useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  styled,
  keyframes,
} from '@mui/material';
import { Team } from '../../types/team';

interface TeamGenerationAnimationProps {
  open: boolean;
  names: string[];
  teams: Team[];
}

// Spinning animation
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Slow spin with deceleration
const slowSpin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(720deg);
  }
`;

// Fade in from bottom
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Spinning wheel container
const SpinningWheel = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'phase',
})<{ phase: 'spinning' | 'slowing' | 'stopped' }>(({ phase }) => ({
  width: '280px',
  height: '280px',
  borderRadius: '50%',
  border: '12px solid #1976d2',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  animation: phase === 'spinning' ? `${spin} 0.8s linear infinite` :
             phase === 'slowing' ? `${slowSpin} 2s ease-out forwards` :
             'none',
}));

// Name items rotating around wheel
const RotatingName = styled(Box)<{ index: number; total: number; phase: string }>(({ index, total, phase }) => {
  const angle = (360 / total) * index;
  const radius = 140;
  const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
  const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;

  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
    backgroundColor: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    whiteSpace: 'nowrap',
    animation: phase === 'spinning' || phase === 'slowing' ? `${spin} 0.8s linear infinite reverse` : 'none',
  };
});

// Team reveal card
const TeamCard = styled(Box)<{ delay: number }>(({ delay }) => ({
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '20px',
  margin: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  animation: `${fadeInUp} 0.6s ease-out ${delay}s both`,
  minWidth: '200px',
}));

const TeamGenerationAnimation: React.FC<TeamGenerationAnimationProps> = ({
  open,
  names,
  teams,
}) => {
  const [phase, setPhase] = useState<'spinning' | 'slowing' | 'stopped' | 'revealing'>('spinning');

  useEffect(() => {
    if (!open) {
      setPhase('spinning');
      return;
    }

    // Animation timeline
    const spinTimer = setTimeout(() => {
      setPhase('slowing');
    }, 1500);

    const stopTimer = setTimeout(() => {
      setPhase('stopped');
    }, 3500);

    const revealTimer = setTimeout(() => {
      setPhase('revealing');
    }, 4000);

    return () => {
      clearTimeout(spinTimer);
      clearTimeout(stopTimer);
      clearTimeout(revealTimer);
    };
  }, [open]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
          overflow: 'visible',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '500px',
          p: 4,
        }}
      >
        {phase !== 'revealing' ? (
          <>
            {/* Spinning Wheel */}
            <SpinningWheel phase={phase}>
              {names.slice(0, 8).map((name, index) => (
                <RotatingName
                  key={index}
                  index={index}
                  total={Math.min(names.length, 8)}
                  phase={phase}
                >
                  {name}
                </RotatingName>
              ))}

              {/* Center content */}
              <Box
                sx={{
                  textAlign: 'center',
                  color: 'white',
                  zIndex: 1,
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  ⚡
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                  {phase === 'spinning' ? 'Shuffling' : 'Pairing'}
                </Typography>
              </Box>
            </SpinningWheel>

            <Typography
              variant="h5"
              sx={{
                color: 'white',
                mt: 4,
                fontWeight: 'medium',
                textAlign: 'center',
              }}
            >
              {phase === 'spinning' && 'Generating Teams...'}
              {phase === 'slowing' && 'Creating Perfect Pairs...'}
              {phase === 'stopped' && 'Teams Ready!'}
            </Typography>
          </>
        ) : (
          <>
            {/* Team Reveal */}
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                mb: 3,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              ✨ Teams Created! ✨
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 2,
                maxWidth: '600px',
              }}
            >
              {teams.map((team, index) => (
                <TeamCard key={team.id} delay={index * 0.2}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#1976d2',
                      fontWeight: 'bold',
                      mb: 1,
                      textAlign: 'center',
                    }}
                  >
                    {team.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ textAlign: 'center', color: '#666' }}
                  >
                    {team.player1} & {team.player2}
                  </Typography>
                </TeamCard>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default TeamGenerationAnimation;
