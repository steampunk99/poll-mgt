"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CalendarIcon, FilterIcon, ArrowUpDown, Activity, UserPlus, Trash2, Edit, Eye } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
// import { DateRangePicker } from "@/components/ui/date-range-picker"

const LOGS_PER_PAGE = 10
const ACTION_ICONS = {
  create_poll: <Activity className="h-4 w-4" />,
  delete_poll: <Trash2 className="h-4 w-4" />,
  edit_poll: <Edit className="h-4 w-4" />,
  vote: <Eye className="h-4 w-4" />,
  register: <UserPlus className="h-4 w-4" />,
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterUser, setFilterUser] = useState("")
  const [filterAction, setFilterAction] = useState("")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [dateRange, setDateRange] = useState(undefined)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, "auditLogs"), orderBy("timestamp", sortOrder))
      const querySnapshot = await getDocs(q)
      const logsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setLogs(logsData)
      setFilteredLogs(logsData)
      setError(null)
    } catch (err) {
      console.error("Error fetching logs:", err)
      setError("Failed to load logs.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [sortOrder])

  const handleFilter = () => {
    let filtered = logs

    if (filterUser) {
      filtered = filtered.filter((log) => log.userId.includes(filterUser))
    }

    if (filterAction) {
      filtered = filtered.filter((log) => log.action === filterAction)
    }

    if (dateRange) {
      filtered = filtered.filter(
        (log) =>
          log.timestamp.toDate() >= dateRange.from && log.timestamp.toDate() <= dateRange.to
      )
    }

    setFilteredLogs(filtered)
    setCurrentPage(1)
  }

  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  const indexOfLastLog = currentPage * LOGS_PER_PAGE
  const indexOfFirstLog = indexOfLastLog - LOGS_PER_PAGE
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog)

  return (
    <Card className="w-full  mt-2">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Audit Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-4">
              <Input
                placeholder="Filter by User ID"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="max-w-xs"
              />
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Actions</SelectItem>
                  <SelectItem value="create_poll">Create Poll</SelectItem>
                  <SelectItem value="delete_poll">Delete Poll</SelectItem>
                  <SelectItem value="edit_poll">Edit Poll</SelectItem>
                  <SelectItem value="vote">Vote</SelectItem>
                  <SelectItem value="register">Register</SelectItem>
                </SelectContent>
              </Select>
              {/* <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              /> */}
              <Button onClick={handleFilter} className="ml-auto">
                <FilterIcon className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
              <Button onClick={handleSort} variant="outline">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort by Date {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.userId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {ACTION_ICONS[log.action] || <Activity className="h-4 w-4" />}
                          {log.action}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{JSON.stringify(log.details)}</TableCell>
                      <TableCell>{format(log.timestamp.toDate(), "PPpp")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-center">
              <Pagination
                total={Math.ceil(filteredLogs.length / LOGS_PER_PAGE)}
                value={currentPage}
                onChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
