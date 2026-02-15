import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useBookContext } from '../context/BookContext'

const ProfileGate = () => {
  const { userVocab, selectUser, loading } = useBookContext()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])

  useEffect(() => {
    if (userVocab.length > 0) {
      // Filter out "[UNK]" and get random 4-5 profiles
      const validUsers = userVocab.filter(id => id !== '[UNK]')
      const shuffled = [...validUsers].sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, 5)
      setProfiles(selected)
    }
  }, [userVocab])

  const handleProfileClick = (userId) => {
    selectUser(userId)
    navigate('/home')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading BookFlix...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-netflix-black flex flex-col items-center justify-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-6xl font-bold text-white mb-16"
      >
        BookFlix
      </motion.h1>
      
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-3xl text-white mb-12"
      >
        Who's Reading?
      </motion.h2>

      <div className="flex gap-8 flex-wrap justify-center">
        {profiles.map((userId, index) => (
          <motion.div
            key={userId}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleProfileClick(userId)}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-32 h-32 rounded-md bg-gradient-to-br from-netflix-red to-red-800 flex items-center justify-center mb-4 overflow-hidden border-2 border-transparent group-hover:border-white transition-all duration-300">
              <span className="text-4xl font-bold text-white">
                {userId.charAt(userId.length - 1)}
              </span>
            </div>
            <span className="text-xl text-gray-400 group-hover:text-white transition-colors">
              User {userId}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ProfileGate
