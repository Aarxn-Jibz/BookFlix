import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as tf from '@tensorflow/tfjs'

const BookContext = createContext()

export const useBookContext = () => {
  const context = useContext(BookContext)
  if (!context) {
    throw new Error('useBookContext must be used within BookProvider')
  }
  return context
}

export const BookProvider = ({ children }) => {
  const [model, setModel] = useState(null)
  const [bookTitles, setBookTitles] = useState([])
  const [bookImages, setBookImages] = useState([])
  const [userVocab, setUserVocab] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUserIndex, setCurrentUserIndex] = useState(null)
  const [likedBooks, setLikedBooks] = useState([])
  const [recommendations, setRecommendations] = useState([])

  // Load all resources
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true)
        
        // Load JSON files in parallel
        const [titlesRes, imagesRes, vocabRes] = await Promise.all([
          fetch('/book_titles.json'),
          fetch('/book_images.json'),
          fetch('/user_vocab.json')
        ])

        // Parse JSON with robust error handling for NaN values
        const titlesText = await titlesRes.text()
        let imagesText = await imagesRes.text()
        const vocabText = await vocabRes.text()

        // ULTRA aggressive NaN cleaning - replace ALL NaN occurrences
        // First pass: replace standalone NaN
        imagesText = imagesText.replace(/\bNaN\b/g, 'null')
        // Second pass: replace "NaN" strings
        imagesText = imagesText.replace(/"NaN"/g, 'null')
        // Third pass: replace any remaining NaN variations
        imagesText = imagesText.replace(/NaN/gi, 'null')
        
        const titles = JSON.parse(titlesText)
        let images
        try {
          images = JSON.parse(imagesText)
        } catch (e) {
          console.error('❌ Failed to parse images JSON:', e.message)
          console.error('First 500 chars of problematic JSON:', imagesText.substring(0, 500))
          // Last resort: try to manually fix common patterns
          imagesText = imagesText
            .replace(/,\s*null\s*,/g, ', null,')  // Fix double commas
            .replace(/\[\s*null\s*\]/g, '[null]') // Fix array with null
            .replace(/,\s*null\s*\]/g, ', null]') // Fix trailing null
            .replace(/\[\s*null\s*,/g, '[null,') // Fix leading null
          try {
            images = JSON.parse(imagesText)
            console.log('✅ Successfully parsed after fallback fix')
          } catch (e2) {
            console.error('❌ Still failed after fallback. Creating empty array.')
            // Create empty array as last resort
            images = new Array(titles.length).fill('')
          }
        }
        const vocab = JSON.parse(vocabText)

        // Clean up images array - replace null/NaN with empty string
        const cleanedImages = images.map((img, index) => {
          if (img === null || img === undefined || img === 'NaN' || String(img).trim() === 'NaN' || String(img) === 'null') {
            return ''
          }
          return String(img)
        })

        console.log('✅ Successfully loaded books:', {
          titles: titles.length,
          images: cleanedImages.length,
          vocab: vocab.length,
          sampleTitle: titles[0],
          sampleImage: cleanedImages[0] || 'placeholder'
        })
        
        // Verify data integrity
        if (titles.length === 0) {
          console.error('❌ No book titles loaded!')
        }
        if (cleanedImages.length === 0) {
          console.warn('⚠️ No book images loaded (will use placeholders)')
        }

        setBookTitles(titles)
        setBookImages(cleanedImages)
        setUserVocab(vocab)

        // Load TensorFlow model
        const loadedModel = await tf.loadGraphModel('/model.json')
        setModel(loadedModel)
        
        // Auto-select a random user (skip [UNK])
        const validUsers = vocab.filter(id => id !== '[UNK]')
        if (validUsers.length > 0) {
          const randomUser = validUsers[Math.floor(Math.random() * validUsers.length)]
          const userIndex = vocab.indexOf(randomUser)
          console.log('Auto-selected user:', randomUser, 'at index:', userIndex)
          setCurrentUserId(randomUser)
          setCurrentUserIndex(userIndex)
        } else {
          console.warn('No valid users found in vocab')
        }
        
        setLoading(false)
        console.log('Resources loaded. Model:', !!loadedModel, 'Titles:', titles.length, 'Images:', images.length, 'Vocab:', vocab.length)
      } catch (error) {
        console.error('Error loading resources:', error)
        setLoading(false)
      }
    }

    loadResources()
  }, [])

  // Get recommendations for a user
  const getRecommendations = useCallback(async (userIndex) => {
    if (!model || userIndex === null || userIndex === undefined) {
      console.warn('Cannot get recommendations: model=', !!model, 'userIndex=', userIndex)
      return []
    }
    
    if (bookTitles.length === 0) {
      console.warn('Book titles not loaded yet')
      return []
    }

    try {
      console.log('Running model prediction for user index:', userIndex)
      // Prepare input tensor: user_indices as Int64
      // Note: TensorFlow.js uses 'int32' for Int64 in JS, but we'll use int32
      const inputTensor = tf.tensor1d([userIndex], 'int32')
      
      // Run prediction
      const prediction = await model.executeAsync({ 'user_indices:0': inputTensor })
      console.log('Model prediction result:', prediction)
      
      // Get the output (top 10 indices)
      // The output is Identity:0 which contains the indices
      let outputTensor
      if (Array.isArray(prediction)) {
        outputTensor = prediction[0] || prediction
      } else {
        outputTensor = prediction
      }
      
      const output = await outputTensor.data()
      console.log('Raw output data:', Array.from(output).slice(0, 10))
      
      // Clean up tensors
      inputTensor.dispose()
      if (Array.isArray(prediction)) {
        prediction.forEach(t => t.dispose())
      } else {
        prediction.dispose()
      }

      // Convert to array of integers and ensure they're valid
      const topIndices = Array.from(output)
        .map(idx => Math.round(Math.abs(idx))) // Ensure positive integers
        .filter(idx => idx >= 0 && idx < bookTitles.length) // Filter valid indices
        .slice(0, 10) // Take top 10
      
      console.log('Processed recommendations:', topIndices)
      return topIndices
    } catch (error) {
      console.error('Error getting recommendations:', error)
      console.error('Error details:', error.message, error.stack)
      return []
    }
  }, [model, bookTitles.length])


  // Set current user and find their index
  const selectUser = useCallback((userId) => {
    setCurrentUserId(userId)
    const index = userVocab.indexOf(userId)
    if (index !== -1) {
      setCurrentUserIndex(index)
    } else {
      console.error('User ID not found in vocab:', userId)
    }
  }, [userVocab])

  // Get book data by index
  const getBookById = useCallback((bookId) => {
    if (bookId < 0 || bookId >= bookTitles.length) {
      return null
    }
    return {
      id: bookId,
      title: bookTitles[bookId] || 'Unknown Book',
      image: bookImages[bookId] || ''
    }
  }, [bookTitles, bookImages])

  // Toggle like status
  const toggleLike = useCallback((bookId) => {
    setLikedBooks(prev => {
      if (prev.includes(bookId)) {
        return prev.filter(id => id !== bookId)
      } else {
        return [...prev, bookId]
      }
    })
  }, [])

  // Check if book is liked
  const isLiked = useCallback((bookId) => {
    return likedBooks.includes(bookId)
  }, [likedBooks])

  // Get random books for trending
  const getRandomBooks = useCallback((count = 15) => {
    if (!bookTitles || bookTitles.length === 0) {
      console.warn('No book titles available for random books')
      return []
    }
    
    const indices = []
    const maxIndex = Math.min(bookTitles.length, 1000) // Limit to first 1000 for performance
    const maxAttempts = count * 10 // Prevent infinite loop
    
    let attempts = 0
    while (indices.length < count && attempts < maxAttempts) {
      const randomIndex = Math.floor(Math.random() * maxIndex)
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex)
      }
      attempts++
    }
    
    console.log(`Generated ${indices.length} random books from ${maxIndex} available`)
    return indices
  }, [bookTitles])

  // Get simulated recommendations for "Because you liked" rows
  const getSimulatedRecommendations = useCallback((likedBookId, count = 12) => {
    // Use top 30 recommendations, but maintain stable order (no random shuffle)
    const top30 = recommendations.slice(0, 30)
    const filtered = top30.filter(id => id !== likedBookId)
    return filtered.slice(0, count)
  }, [recommendations])

  // Update recommendations when user changes OR when liked books change
  useEffect(() => {
    if (currentUserIndex !== null && model && bookTitles.length > 0) {
      console.log('Getting recommendations for user index:', currentUserIndex, 'Liked books:', likedBooks.length)
      getRecommendations(currentUserIndex)
        .then(recs => {
          console.log('Recommendations received:', recs)
          if (recs && recs.length > 0) {
            // Filter out already liked books from recommendations
            let filteredRecs = recs.filter(bookId => !likedBooks.includes(bookId))
            
            // If user has liked books, enhance recommendations with similar books
            if (likedBooks.length > 0) {
              // Get recommendations based on liked books - use stable order
              const likedBasedRecs = []
              likedBooks.forEach(likedBookId => {
                const similarBooks = getSimulatedRecommendations(likedBookId, 5)
                similarBooks.forEach(bookId => {
                  if (!likedBasedRecs.includes(bookId) && !likedBooks.includes(bookId)) {
                    likedBasedRecs.push(bookId)
                  }
                })
              })
              
              // Combine: prioritize liked-based recommendations, then fill with model recommendations
              const newCombined = [
                ...likedBasedRecs.slice(0, 5), // Top 5 from liked books
                ...filteredRecs.filter(id => !likedBasedRecs.includes(id))
              ].slice(0, 10) // Keep top 10
              
              // Stability check: only update if books actually changed
              // Preserve order when match scores would be the same
              const currentRecs = recommendations.length > 0 ? recommendations : []
              
              // Check if it's just a reordering of the same books (same match scores)
              const currentSet = new Set(currentRecs)
              const newSet = new Set(newCombined)
              const sameBooks = currentSet.size === newSet.size && 
                                [...currentSet].every(id => newSet.has(id))
              
              if (sameBooks && currentRecs.length > 0) {
                // Same books, keep current order (preserves match scores)
                console.log('⏸️ Same books detected, preserving order for stable match scores')
                // Don't update - keep current recommendations
              } else if (newCombined.length > 0) {
                // Different books or first time - update
                setRecommendations(newCombined)
                console.log('✅ Updated recommendations based on liked books:', newCombined)
              }
            } else {
              // No liked books yet, use original recommendations
              // Only update if different to prevent unnecessary re-renders
              const currentRecs = recommendations
              if (JSON.stringify(currentRecs) !== JSON.stringify(filteredRecs.length > 0 ? filteredRecs : recs)) {
                setRecommendations(filteredRecs.length > 0 ? filteredRecs : recs)
              }
            }
          } else {
            // Fallback: use random books if model fails
            console.warn('No recommendations from model, using fallback')
            const fallback = Array.from({ length: 10 }, (_, i) => Math.floor(Math.random() * Math.min(bookTitles.length, 1000)))
            setRecommendations(fallback)
          }
        })
        .catch(error => {
          console.error('Error in recommendation effect:', error)
          // Fallback on error
          const fallback = Array.from({ length: 10 }, (_, i) => Math.floor(Math.random() * Math.min(bookTitles.length, 1000)))
          setRecommendations(fallback)
        })
    }
  }, [currentUserIndex, model, getRecommendations, bookTitles.length, likedBooks, getSimulatedRecommendations])

  const value = {
    loading,
    currentUserId,
    currentUserIndex,
    likedBooks,
    recommendations,
    bookTitles,
    bookImages,
    userVocab,
    selectUser,
    getBookById,
    toggleLike,
    isLiked,
    getRandomBooks,
    getSimulatedRecommendations
  }

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>
}
