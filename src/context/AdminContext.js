import React, { createContext, useContext, useState } from 'react'
import { db } from '../lib/firebase'
import { collection, getDocs, query, orderBy, limit as firestoreLimit, where } from 'firebase/firestore'

const AdminContext = createContext()

export const useAdmin = () => {
  return useContext(AdminContext)
}

export const AdminProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const pollStats = async () => {
    try {
      const pollsRef = collection(db, 'polls')
      const pollsSnapshot = await getDocs(pollsRef)
      const totalPolls = pollsSnapshot.size

      const now = new Date()
      const activePolls = pollsSnapshot.docs.filter(doc => {
        const data = doc.data()
        return data.deadline?.toDate() > now
      }).length

      return { totalPolls, activePolls }
    } catch (err) {
      console.error("Error getting poll stats:", err)
      throw err
    }
  }

  const userStats = async () => {
    try {
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(usersRef)
      const totalUsers = usersSnapshot.size

      const activeUsers = usersSnapshot.docs.filter(doc => {
        const data = doc.data()
        return data.isActive === true
      }).length

      const adminUsers = usersSnapshot.docs.filter(doc => {
        const data = doc.data()
        return data.role === 'admin'
      }).length

      return { totalUsers, activeUsers, adminUsers }
    } catch (err) {
      console.error("Error getting user stats:", err)
      throw err
    }
  }

  const getPollEngagement = async () => {
    try {
      const pollsRef = collection(db, 'polls')
      const pollsSnapshot = await getDocs(query(pollsRef, orderBy('createdAt', 'desc')))

      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))

      const engagementData = pollsSnapshot.docs.map(doc => {
        const data = doc.data()
        const createdAt = data.createdAt?.toDate() || new Date()
        const deadline = data.deadline?.toDate?.() || null
        const totalVotes = data.choices?.reduce((sum, choice) => sum + (choice.votes || 0), 0) || 0
        const daysActive = Math.max(1, Math.ceil((now - createdAt) / (1000 * 60 * 60 * 24)))
        const averageVotesPerDay = totalVotes / daysActive

        return {
          id: doc.id,
          question: data.question || 'Untitled Poll',
          totalVotes,
          averageVotesPerDay,
          createdAt,
          deadline,
          status: deadline && deadline > now ? 'active' : 'closed',
          choices: data.choices?.map(choice => ({
            text: choice.text || '',
            votes: choice.votes || 0,
            percentage: totalVotes > 0 ? ((choice.votes || 0) / totalVotes * 100).toFixed(1) : 0
          })) || [],
          visibility: data.visibility || 'public',
          engagement: {
            votesPerChoice: data.choices?.length > 0 ? (totalVotes / data.choices.length).toFixed(1) : 0,
            isRecentlyActive: createdAt >= thirtyDaysAgo,
            daysActive,
            daysRemaining: deadline ? Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))) : 0
          }
        }
      })

      // Calculate engagement metrics
      const totalPolls = engagementData.length
      const activePolls = engagementData.filter(poll => poll.status === 'active').length
      const totalVotes = engagementData.reduce((sum, poll) => sum + poll.totalVotes, 0)
      const averageVotesPerPoll = totalPolls > 0 ? (totalVotes / totalPolls).toFixed(1) : 0

      // Calculate vote distribution over time
      const votesOverTime = engagementData
        .filter(poll => poll.engagement.isRecentlyActive)
        .map(poll => ({
          date: poll.createdAt,
          votes: poll.totalVotes
        }))
        .sort((a, b) => a.date - b.date)

      // Get top performing polls
      const topPerformingPolls = [...engagementData]
        .sort((a, b) => b.averageVotesPerDay - a.averageVotesPerDay)
        .slice(0, 5)
        .map(poll => ({
          question: poll.question,
          averageVotesPerDay: Math.round(poll.averageVotesPerDay)
        }))

      // Calculate engagement trends
      const participationRate = totalPolls > 0 
        ? Math.round((activePolls / totalPolls) * 100)
        : 0

      const growthRate = 0 // This would need historical data to calculate properly

      // Find peak activity time (simplified)
      const mostEngagedTimeOfDay = "9:00 AM - 5:00 PM" // This would need timestamp analysis to be accurate

      return {
        metrics: {
          totalPolls,
          activePolls,
          totalVotes,
          averageVotesPerPoll,
          engagementTrends: {
            participationRate,
            growthRate,
            mostEngagedTimeOfDay
          },
          votesOverTime,
          topPerformingPolls
        }
      }

    } catch (err) {
      console.error("Error fetching poll engagement:", err)
      throw err
    }
  }

  const generateDailyVotesData = (polls, startDate, endDate) => {
    const dailyVotes = {}
    
    // Initialize all dates with 0 votes
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dailyVotes[d.toISOString().split('T')[0]] = 0
    }

    // Distribute votes across days
    polls.forEach(poll => {
      if (poll.createdAt >= startDate) {
        const votesPerDay = poll.totalVotes / poll.engagement.daysActive
        for (let d = new Date(poll.createdAt); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateKey = d.toISOString().split('T')[0]
          if (dailyVotes[dateKey] !== undefined) {
            dailyVotes[dateKey] += votesPerDay
          }
        }
      }
    })

    return Object.entries(dailyVotes).map(([date, votes]) => ({
      date,
      votes: Math.round(votes)
    }))
  }

  const getMostEngagedTimeOfDay = (polls) => {
    // For now, return a static time range based on typical work hours
    // This could be enhanced with actual vote timestamp data
    return "2:00 PM - 4:00 PM"
  }

  const getUserActivity = async () => {
    try {
      const usersSnapshot = await getDocs(
        query(collection(db, 'users'), 
        orderBy('createdAt', 'desc'))
      )
      return usersSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          displayName: data.displayName,
          email: data.email,
          createdAt: data.createdAt?.toDate(),
          isActive: data.isActive
        }
      })
    } catch (err) {
      console.error("Error fetching user activity:", err)
      throw err
    }
  }

  const getRecentPolls = async (limitCount = 5) => {
    try {
      const pollsSnapshot = await getDocs(
        query(
          collection(db, 'polls'),
          orderBy('createdAt', 'desc'),
          firestoreLimit(limitCount)
        )
      )
      return pollsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (err) {
      console.error("Error fetching recent polls:", err)
      throw err
    }
  }

  const value = {
    pollStats,
    userStats,
    loading,
    error,
    getPollEngagement,
    getUserActivity,
    getRecentPolls
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}