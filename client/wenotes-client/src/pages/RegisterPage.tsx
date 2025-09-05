import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RegisterForm from '../components/forms/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#edffec] flex items-center justify-center px-4">
      <motion.div 
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Levo (plavi gradient) */}
        <motion.div 
          className="hidden md:flex bg-gradient-to-br from-[#60cbff] to-[#4db8e6] text-white p-10 items-center justify-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          <div className="max-w-md text-center">
            <motion.h2 
              className="text-3xl font-extrabold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              Join WeNotes!
            </motion.h2>
            <motion.p 
              className="text-white/90 leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              Create your account and start organizing your thoughts with WeNotes. 
              Join our community of note-takers and stay organized with our powerful note-taking platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full md:w-auto rounded-full px-8 py-3 bg-white/20 hover:bg-white/30 transition
                           backdrop-blur text-white font-medium"
              >
                Already have an account? Sign in.
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Desno (belo) */}
        <motion.div 
          className="bg-white p-8 md:p-12 flex items-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <div className="w-full">
            <motion.h1 
              className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              Sign up
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <RegisterForm />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
