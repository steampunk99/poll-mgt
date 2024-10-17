"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs, where, limit as firestoreLimit } from 'firebase/firestore'
import { db } from '../lib/firebase'

const AdminContext = createContext()

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export function AdminProvider({ children }) {
  const [pollStats, setPollStats] = useState({
    totalPolls: 0,
    activePolls: 0,
    totalVotes: 0,
    averageVotesPerPoll: 0
  })
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const pollsSnapshot = await getDocs(collection(db, 'polls'))
      const usersSnapshot = await getDocs(collection(db, 'users'))

      const pollsData = pollsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      setPollStats(calculatePollStats(pollsData))
      setUserStats(calculateUserStats(usersData))
    } catch (err) {
      console.error('Error fetching admin data:', err)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const calculatePollStats = (polls) => {
    const totalPolls = polls.length
    const activePolls = polls.filter(poll => poll.status === 'active').length
    const totalVotes = polls.reduce((sum, poll) => sum + poll.choices.reduce((total, choice) => total + choice.votes, 0), 0)
    const averageVotesPerPoll = totalPolls > 0 ? totalVotes / totalPolls : 0

    return { totalPolls, activePolls, totalVotes, averageVotesPerPoll }
  }

  const calculateUserStats = (users) => {
    const totalUsers = users.length
    const activeUsers = users.filter(user => user.isActive).length
    const adminUsers = users.filter(user => user.role === 'admin').length

    return { totalUsers, activeUsers, adminUsers }
  }

  const getPollEngagement = async () => {
    const pollsSnapshot = await getDocs(query(collection(db, 'polls'), orderBy('createdAt', 'desc')))
    return pollsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        question: data.question,
        totalVotes: data.choices.reduce((sum, choice) => sum + choice.votes, 0),
        createdAt: data.createdAt.toDate(),
      }
    })
  }

  const getUserActivity = async () => {
    const usersSnapshot = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
    return usersSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        displayName: data.displayName,
        email: data.email,
        createdAt: data.createdAt.toDate(),
        isActive: data.isActive,
      }
    })
  }

  const getRecentPolls = async (limitCount = 5) => {
    const pollsSnapshot = await getDocs(query(
      collection(db, 'polls'), 
      orderBy('createdAt', 'desc'), 
      firestoreLimit(limitCount)
    ))
    return pollsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const value = {
    pollStats,
    userStats,
    loading,
    error,
    getPollEngagement,
    getUserActivity,
    getRecentPolls,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}