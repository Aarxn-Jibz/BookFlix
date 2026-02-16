import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import Row from '../components/Row'
import { useBookContext } from '../context/BookContext'
import { Search } from 'lucide-react'

const Home = () => {
  const {
    recommendations,
    likedBooks,
    getBookById,
    getRandomBooks,
    getSimulatedRecommendations,
    bookTitles
  } = useBookContext()
  const [trendingBooks, setTrendingBooks] = useState([])
  const [popularBooks, setPopularBooks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    // Generate trending and popular books immediately when bookTitles are available
    if (bookTitles && bookTitles.length > 0) {
      const trending = getRandomBooks(15)
      const popular = getRandomBooks(20)
      setTrendingBooks(trending)
      setPopularBooks(popular)
    }
  }, [getRandomBooks, bookTitles])

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([])
      setShowSearch(false)
      return
    }

    if (!bookTitles || bookTitles.length === 0) {
      setSearchResults([])
      return
    }

    setShowSearch(true) // Always show when there's a query
    const query = searchQuery.toLowerCase().trim()
    const results = []

    // Search through ALL books - no limit
    console.log('🔍 Searching through', bookTitles.length, 'books for:', query)
    const startTime = performance.now()

    for (let i = 0; i < bookTitles.length; i++) {
      const title = bookTitles[i]
      if (title && typeof title === 'string' && title.toLowerCase().includes(query)) {
        results.push(i)
      }
      // Show progress for large searches
      if (i % 10000 === 0 && i > 0) {
        console.log(`  Searched ${i}/${bookTitles.length} books, found ${results.length} matches...`)
      }
    }

    const endTime = performance.now()
    console.log(`✅ Search complete: ${results.length} results in ${(endTime - startTime).toFixed(2)}ms`)

    // Limit display to 50 results for performance, but search all
    setSearchResults(results.slice(0, 50))
  }, [searchQuery, bookTitles])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-netflix-black"
    >
      {/* Search Bar */}
      <div className="sticky top-0 z-50 bg-netflix-black/95 backdrop-blur-sm px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <h1 className="text-3xl font-bold text-netflix-red">BookFlix</h1>
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for books..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearch(true) // Always show results when typing
                }}
                onFocus={() => setShowSearch(true)}
                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-netflix-red transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {showSearch && searchQuery && searchQuery.trim() !== '' && (
        <div className="relative z-40 px-8 py-4 bg-netflix-black" onClick={(e) => e.stopPropagation()}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            {searchResults.length > 0 ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Search Results for "{searchQuery}" ({searchResults.length} {searchResults.length === 50 ? '(showing first 50)' : ''})
                </h2>
                <Row
                  title=""
                  books={searchResults}
                  showMatch={false}
                />
              </>
            ) : searchQuery.trim() !== '' ? (
              <div className="text-white text-xl py-8">
                No books found matching "{searchQuery}"
              </div>
            ) : null}
          </motion.div>
        </div>
      )}

      {/* Click outside to close search */}
      {showSearch && searchQuery && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => {
            setShowSearch(false)
            // Don't clear searchQuery - let user keep typing
          }}
        />
      )}

      {/* Hero Banner - only show if we have recommendations */}
      {recommendations && recommendations.length > 0 && <Hero />}

      {/* Content Rows */}
      <div className={`mt-8 pb-16 ${showSearch && searchQuery ? 'opacity-50 pointer-events-none' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Top Picks for You */}
          {recommendations && recommendations.length > 0 && (
            <Row
              title="Top Picks for You"
              books={recommendations.slice(0, 10)}
              showMatch={true}
            />
          )}

          {/* Your Saved Books - Show at top if user has liked books */}
          {likedBooks.length > 0 && (
            <Row
              title="Your Saved Books"
              books={likedBooks}
              showMatch={false}
            />
          )}

          {/* Because you liked... - Show below saved books */}
          {likedBooks.map((likedBookId) => {
            const book = getBookById(likedBookId)
            if (!book) return null

            const simulatedRecs = getSimulatedRecommendations(likedBookId, 12)
            if (simulatedRecs.length === 0) return null

            return (
              <Row
                key={`liked-${likedBookId}`}
                title={`Because you liked ${book.title}`}
                books={simulatedRecs}
                showMatch={false}
              />
            )
          })}

          {/* Popular Books - Show below "because you liked" sections */}
          {popularBooks.length > 0 && (
            <Row
              title="Popular Now"
              books={popularBooks}
              showMatch={false}
            />
          )}

          {/* Trending Now */}
          {trendingBooks.length > 0 && (
            <Row
              title="Trending Now"
              books={trendingBooks}
              showMatch={false}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Home
