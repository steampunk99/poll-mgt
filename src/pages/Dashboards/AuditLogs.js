"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CalendarIcon, FilterIcon, ArrowUpDown, Activity, UserPlus, Trash2, Edit, Eye, Download, AlertCircle, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import * as XLSX from 'xlsx'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const LOGS_PER_PAGE = 10
const ACTION_COLORS = {
  create_poll: "bg-green-600 hover:bg-green-700",
  delete_poll: "bg-red-600 hover:bg-red-700",
  edit_poll: "bg-orange-500 hover:bg-orange-600",
  vote: "bg-indigo-600 hover:bg-indigo-700",
  register: "bg-violet-600 hover:bg-violet-700",
}
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
      filtered = filtered.filter((log) => log.userId.toLowerCase().includes(filterUser.toLowerCase()))
    }

    if (filterAction && filterAction !== "All") {
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

  const handleExport = () => {
    try {
      const exportData = filteredLogs.map(log => ({
        'User ID': log.userId,
        'Action': log.action,
        'Details': JSON.stringify(log.details),
        'Date': format(log.timestamp.toDate(), "PPpp")
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Audit Logs')
      
      // Auto-size columns
      const colWidths = Object.keys(exportData[0]).map(key => ({
        wch: Math.max(key.length, ...exportData.map(row => String(row[key]).length))
      }))
      ws['!cols'] = colWidths

      XLSX.writeFile(wb, `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
    } catch (error) {
      console.error('Error exporting logs:', error)
    }
  }

  const resetFilters = () => {
    setFilterUser("")
    setFilterAction("")
    setDateRange(undefined)
    setFilteredLogs(logs)
    setCurrentPage(1)
  }

  const indexOfLastLog = currentPage * LOGS_PER_PAGE
  const indexOfFirstLog = indexOfLastLog - LOGS_PER_PAGE
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog)

  return (
    <Card className="w-full mt-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">Audit Logs</CardTitle>
            <CardDescription className="mt-2">
              Track and monitor system activities and user actions
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700">
            <Download className="mr-2 h-4 w-4" /> Export to Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Filter by User ID"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-[180px]">
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger>
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
              </div>
              <Button onClick={handleFilter} variant="secondary">
                <FilterIcon className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
              <Button onClick={resetFilters} variant="outline" className="border-dashed">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
              <Button onClick={handleSort} variant="outline">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>

            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>User ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{log.userId}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`${ACTION_COLORS[log.action]} text-white font-medium px-3 py-1`}
                        >
                          <div className="flex items-center gap-2">
                            {ACTION_ICONS[log.action] || <Activity className="h-4 w-4" />}
                            {log.action.split('_').join(' ')}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <span className="text-muted-foreground">
                          {JSON.stringify(log.details)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {format(log.timestamp.toDate(), "PPpp")}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} entries
              </div>
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
