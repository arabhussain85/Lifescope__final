import React from 'react';
import { FaGithub, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-transparent text-foreground py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-primary select-none">LifeScope</h3>
            <p className="text-xs text-muted-foreground">Organize Your Life, Role by Role</p>
          </div>
          <div className="flex space-x-4">
            <motion.a
              href="https://github.com/arabhussain85"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaGithub size={20} />
            </motion.a>
            <motion.a
              href="https://instagram.com/arab.hussain85"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaInstagram size={20} />
            </motion.a>
            <motion.a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTwitter size={20} />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/arab-hussain-467456342/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaLinkedin size={20} />
            </motion.a>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>&copy; {currentYear} LifeScope. All rights reserved.</p>
          <p>Built with ❤️ by Arab Hussain</p>
        </div>
      </div>
    </footer>
  );
}

