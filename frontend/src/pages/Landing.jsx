import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Cone, Stars, Text } from "@react-three/drei";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/LandingNav";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";

const AnimatedCone = ({ darkMode }) => {
  const meshRef = useRef();
  
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.PI / 4;
    }
  }, []);

  return (
    <Cone args={[1.5, 3, 32]} ref={meshRef}>
      <meshPhongMaterial
        attach="material"
        color={darkMode ? "#FF6347" : "#1E90FF"}
        wireframe
        transparent
        opacity={0.7}
      />
    </Cone>
  );
};

const Landing = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showAuthButtons, setShowAuthButtons] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const controls = useAnimation();

  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);

    // Hide welcome message after 5 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleThemeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  const handleGetStarted = () => {
    setShowAuthButtons(true);
    controls.start({
      scale: [1, 1.1, 1],
      transition: { duration: 0.3 }
    });
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-500 ${
      darkMode ? "dark bg-gray-900 text-white" : "bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900"
    }`}>
      <Navbar darkMode={darkMode} handleThemeToggle={handleThemeToggle} />

      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            {darkMode && <Stars />}
            <AnimatedCone darkMode={darkMode} />
            <Text
              position={[0, 2, 0]}
              fontSize={0.5}
              color={darkMode ? "#ffffff" : "#000000"}
            >
              LifeScope
            </Text>
          </Canvas>
        </div>

        <AnimatePresence>
          {showWelcome && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-black to-gray-900 bg-opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <motion.h1
                  className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  WELCOME TO
                </motion.h1>
                <motion.div
                  className="text-6xl sm:text-7xl md:text-8xl font-black mt-2 text-white"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  LIFESCOPE
                </motion.div>
                <motion.div
                  className="text-2xl sm:text-3xl md:text-4xl font-light mt-6 text-blue-300"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  CREATED BY ARAB HUSSAIN
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.header
          className="text-center mt-12 mb-16 z-10"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className={`text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-wide bg-clip-text text-transparent ${
            darkMode ? "bg-gradient-to-r from-blue-400 to-purple-500" : "bg-gradient-to-r from-blue-600 to-indigo-600"
          }`}>
            LifeScope
          </h1>
          <motion.p 
            className="text-lg sm:text-xl mt-4 font-medium text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Organize Your Life, Role by Role
          </motion.p>
        </motion.header>

        <motion.div
          className={`max-w-lg w-full text-center px-6 py-8 rounded-2xl shadow-2xl backdrop-blur-md hover:shadow-lg transition-all duration-300 z-10 ${
            darkMode ? "bg-gray-800" : "bg-white/80"
          }`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.h2
            className="text-xl sm:text-2xl font-semibold mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Live a Life by Design, Not Default
          </motion.h2>

          <AnimatePresence mode="wait">
            {!showAuthButtons ? (
              <motion.div
                key="getStarted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className={`bg-gradient-to-r ${
                    darkMode ? "from-purple-500 to-pink-500" : "from-blue-500 to-indigo-500"
                  } text-white hover:opacity-90 transition-all duration-300 transform hover:scale-105 hover:rotate-1`}
                >
                  Get Started
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="authButtons"
                className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0 mt-6 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Link to="/login" className="w-full sm:w-1/2">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full transition-all duration-300 transform hover:scale-105 hover:-rotate-1"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup" className="w-full sm:w-1/2">
                  <Button
                    size="lg"
                    className={`w-full ${
                      darkMode ? "bg-purple-500 hover:bg-purple-600" : "bg-blue-500 hover:bg-blue-600"
                    } text-white transition-all duration-300 transform hover:scale-105 hover:rotate-1`}
                  >
                    Signup
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
};

export default Landing;

