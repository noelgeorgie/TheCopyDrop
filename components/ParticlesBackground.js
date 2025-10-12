// File: components/ParticlesBackground.js

import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { useTheme } from '../context/ThemeContext';

const ParticlesBackground = () => {
  const { theme } = useTheme();

  const particlesInit = useCallback(async (engine) => {
    // This loads the tsparticles package bundle, it's required for this to work
    await loadSlim(engine);
  }, []);

  const options = {
    background: {
      color: {
        value: 'transparent', // Make background transparent so CSS background shows
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'repulse', // Pushes particles away from the cursor
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        // Use different particle colors for light and dark themes
        value: theme === 'dark' ? '#ffffff' : '#333333',
      },
      links: {
        color: theme === 'dark' ? '#ffffff' : '#333333',
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'bounce',
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.2,
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  };

  return <Particles id="tsparticles" init={particlesInit} options={options} />;
};

export default ParticlesBackground;