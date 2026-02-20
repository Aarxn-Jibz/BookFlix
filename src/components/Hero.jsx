import { motion } from 'framer-motion'
import React, { useState, useEffect } from 'react'
import { useBookContext } from '../context/BookContext'
import { Play } from 'lucide-react'

const Hero = () => {
  const { recommendations, getBookById, getRandomBooks } = useBookContext()
  const [heroBook, setHeroBook] = useState(null)

  useEffect(() => {
    if (recommendations && recommendations.length > 0) {
      const topBookId = recommendations[0]

      // Prevent unnecessary updates/re-renders if the top book hasn't changed
      if (heroBook && heroBook.id === topBookId) {
        return
      }

      const book = getBookById(topBookId)
      if (book) {
        // Generate a stable "match score" for this session/book
        // For the top pick, usually 95-99%
        const score = 95 + Math.floor(Math.random() * 5)
        setHeroBook({ ...book, matchScore: score })
        return
      }
    }

    // Fallback to random book if no recommendations and no current hero
    if (!heroBook) {
      const randomBooks = getRandomBooks(1)
      if (randomBooks.length > 0) {
        const book = getBookById(randomBooks[0])
        if (book) setHeroBook({ ...book, matchScore: 90 + Math.floor(Math.random() * 8) })
      }
    }
  }, [recommendations, getBookById, getRandomBooks, heroBook])

  if (!heroBook) {
    return null
  }

  const topBook = heroBook

  if (!topBook) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-[50vh] overflow-hidden"
    >
      {/* Background Image */}
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={topBook.image || 'https://via.placeholder.com/1920x1080?text=Book+Cover'}
          referrerPolicy="no-referrer"
          alt={topBook.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = 'https://via.placeholder.com/1920x1080?text=Book+Cover';
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl"
        >
          {/* Match Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-4"
          >
            <span className="inline-block px-3 py-1.5 bg-netflix-red text-white font-bold rounded-md text-sm">
              {topBook.matchScore || 98}% Match
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-2xl">
            {topBook.title}
          </h1>

          {/* Read Now Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-semibold text-base rounded-md hover:bg-opacity-90 transition-all duration-200"
          >
            <Play className="w-6 h-6 fill-black" />
            Read Now
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default React.memo(Hero)


