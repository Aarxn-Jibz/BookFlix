import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { BookProvider, useBookContext } from './context/BookContext'
import Home from './pages/Home'
import { motion } from 'framer-motion'

const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-netflix-black flex flex-col items-center justify-center"
    >
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-6xl font-bold text-white mb-8"
      >
        BookFlix
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-white text-2xl"
      >
        Loading BookFlix...
      </motion.div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '200px' }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-8 h-1 bg-netflix-red"
      />
    </motion.div>
  )
}

function AppRoutes() {
  const { loading } = useBookContext()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Home />
          </motion.div>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BookProvider>
      <Router>
        <AppRoutes />
      </Router>
    </BookProvider>
  )
}

export default App
