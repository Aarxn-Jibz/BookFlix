import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useBookContext } from '../context/BookContext'
import { useState } from 'react'

const BookCard = ({ bookId, showMatch, matchScore, index }) => {
  const { getBookById, toggleLike, isLiked } = useBookContext()
  const [isHovered, setIsHovered] = useState(false)
  const book = getBookById(bookId)
  const liked = isLiked(bookId)

  if (!book) return null

  const handleHeartClick = (e) => {
    e.stopPropagation()
    toggleLike(bookId)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative flex-shrink-0 w-48 h-72 cursor-pointer group"
    >
      <motion.div
        whileHover={{ scale: 1.1, zIndex: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full h-full rounded-md overflow-hidden shadow-lg"
      >
        {/* Book Cover */}
        <img
          src={book.image || 'https://via.placeholder.com/300x450?text=Book+Cover'}
          alt={book.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x450?text=Book+Cover'
          }}
        />

        {/* Gradient Overlay on Hover */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"
          />
        )}

        {/* Match Score on Hover */}
        {isHovered && showMatch && matchScore !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-16 left-2 right-2"
          >
            <div className="bg-netflix-red px-3 py-1 rounded text-white text-sm font-semibold text-center">
              {matchScore}% Match
            </div>
          </motion.div>
        )}

        {/* Book Title on Hover */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-2 left-2 right-2"
          >
            <p className="text-white text-sm font-medium line-clamp-2 drop-shadow-lg">
              {book.title}
            </p>
          </motion.div>
        )}

        {/* Heart Icon */}
        <motion.button
          onClick={handleHeartClick}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${
              liked
                ? 'fill-netflix-red text-netflix-red'
                : 'text-white fill-none'
            } transition-all duration-200`}
          />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

const Row = ({ title, books, showMatch = false }) => {
  const calculateMatchScore = (index) => {
    if (!showMatch) return undefined
    // Top picks: descending from 98%
    return Math.max(98 - index * 2, 85)
  }

  if (!books || books.length === 0) {
    return null
  }

  // Filter out invalid book IDs
  const validBooks = books.filter(bookId => 
    bookId !== null && 
    bookId !== undefined && 
    !isNaN(bookId) && 
    bookId >= 0
  )

  if (validBooks.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      {title && <h2 className="text-2xl font-bold text-white mb-4 px-8">{title}</h2>}
      <div className="flex gap-4 overflow-x-auto px-8 pb-4 scrollbar-hide">
        <div className="flex gap-4">
          {validBooks.map((bookId, index) => (
            <BookCard
              key={`${bookId}-${index}`}
              bookId={bookId}
              showMatch={showMatch}
              matchScore={calculateMatchScore(index)}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Row
