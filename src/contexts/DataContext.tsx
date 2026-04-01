import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { SEED_COMPLAINTS } from '#/data/complaints'
import { SEED_PROGRESS } from '#/data/elearning'
import { PAYSLIPS } from '#/data/payslips'
import { DEMO_USERS } from '#/data/users'
import { loadFromStorage, saveToStorage } from '#/lib/localStorage'
import type { Complaint, ComplaintStatus, TimelineEvent, Attachment } from '#/types/complaint'
import type { CourseProgress } from '#/types/elearning'
import type { Payslip } from '#/types/payslip'
import type { User, UserRole } from '#/types/user'

interface DataContextValue {
  complaints: Complaint[]
  payslips: Payslip[]
  users: User[]
  elearningProgress: CourseProgress[]
  addComplaint: (complaint: Complaint) => void
  updateComplaintStatus: (complaintId: string, newStatus: ComplaintStatus, actor: string, note: string) => void
  addNote: (complaintId: string, note: string, actor: string, attachments?: Attachment[]) => void
  updateUserRole: (userId: string, newRole: UserRole) => void
  getComplaintsForUser: (userId: string) => Complaint[]
  getComplaintsForDivision: (division: string) => Complaint[]
  getPayslipsForUser: (userId: string) => Payslip[]
  toggleContentCompletion: (userId: string, courseId: string, contentId: string) => void
  toggleBookmark: (userId: string, courseId: string) => void
  getProgressForUser: (userId: string) => CourseProgress[]
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(() =>
    loadFromStorage('complaints', SEED_COMPLAINTS),
  )
  const [payslips] = useState<Payslip[]>(() => loadFromStorage('payslips', PAYSLIPS))
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', DEMO_USERS))
  const [elearningProgress, setElearningProgress] = useState<CourseProgress[]>(() =>
    loadFromStorage('elearning_progress', SEED_PROGRESS),
  )

  const persistComplaints = (updated: Complaint[]) => {
    setComplaints(updated)
    saveToStorage('complaints', updated)
  }

  const persistProgress = (updated: CourseProgress[]) => {
    setElearningProgress(updated)
    saveToStorage('elearning_progress', updated)
  }

  const addComplaint = useCallback(
    (complaint: Complaint) => {
      const updated = [complaint, ...complaints]
      persistComplaints(updated)
    },
    [complaints],
  )

  const updateComplaintStatus = useCallback(
    (complaintId: string, newStatus: ComplaintStatus, actor: string, note: string) => {
      const updated = complaints.map((c) => {
        if (c.id !== complaintId) return c
        const event: TimelineEvent = {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'status-change',
          description: note,
          actor,
          newStatus,
        }
        return { ...c, status: newStatus, lastUpdated: event.timestamp, timeline: [...c.timeline, event] }
      })
      persistComplaints(updated)
    },
    [complaints],
  )

  const addNote = useCallback(
    (complaintId: string, note: string, actor: string, noteAttachments?: Attachment[]) => {
      const updated = complaints.map((c) => {
        if (c.id !== complaintId) return c
        const event: TimelineEvent = {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'note',
          description: note,
          actor,
        }
        const existingAttachments = c.attachments ?? []
        const newAttachments = noteAttachments && noteAttachments.length > 0
          ? [...existingAttachments, ...noteAttachments]
          : existingAttachments
        return {
          ...c,
          lastUpdated: event.timestamp,
          timeline: [...c.timeline, event],
          attachments: newAttachments.length > 0 ? newAttachments : undefined,
        }
      })
      persistComplaints(updated)
    },
    [complaints],
  )

  const updateUserRole = useCallback(
    (userId: string, newRole: UserRole) => {
      const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      setUsers(updated)
      saveToStorage('users', updated)
    },
    [users],
  )

  const getComplaintsForUser = useCallback(
    (userId: string) => complaints.filter((c) => c.userId === userId),
    [complaints],
  )

  const getComplaintsForDivision = useCallback(
    (division: string) => complaints.filter((c) => c.userDivision === division),
    [complaints],
  )

  const getPayslipsForUser = useCallback(
    (userId: string) => payslips.filter((p) => p.userId === userId),
    [payslips],
  )

  const toggleContentCompletion = useCallback(
    (userId: string, courseId: string, contentId: string) => {
      const existing = elearningProgress.find((p) => p.userId === userId && p.courseId === courseId)
      if (existing) {
        const completed = existing.completedContentIds.includes(contentId)
          ? existing.completedContentIds.filter((id) => id !== contentId)
          : [...existing.completedContentIds, contentId]
        const updated = elearningProgress.map((p) =>
          p.userId === userId && p.courseId === courseId
            ? { ...p, completedContentIds: completed, lastAccessedDate: new Date().toISOString().split('T')[0] }
            : p,
        )
        persistProgress(updated)
      } else {
        const newProgress: CourseProgress = {
          userId,
          courseId,
          completedContentIds: [contentId],
          bookmarked: false,
          lastAccessedDate: new Date().toISOString().split('T')[0],
        }
        persistProgress([...elearningProgress, newProgress])
      }
    },
    [elearningProgress],
  )

  const toggleBookmark = useCallback(
    (userId: string, courseId: string) => {
      const existing = elearningProgress.find((p) => p.userId === userId && p.courseId === courseId)
      if (existing) {
        const updated = elearningProgress.map((p) =>
          p.userId === userId && p.courseId === courseId ? { ...p, bookmarked: !p.bookmarked } : p,
        )
        persistProgress(updated)
      } else {
        const newProgress: CourseProgress = {
          userId,
          courseId,
          completedContentIds: [],
          bookmarked: true,
          lastAccessedDate: new Date().toISOString().split('T')[0],
        }
        persistProgress([...elearningProgress, newProgress])
      }
    },
    [elearningProgress],
  )

  const getProgressForUser = useCallback(
    (userId: string) => elearningProgress.filter((p) => p.userId === userId),
    [elearningProgress],
  )

  return (
    <DataContext.Provider
      value={{
        complaints, payslips, users, elearningProgress,
        addComplaint, updateComplaintStatus,
        addNote, updateUserRole, getComplaintsForUser, getComplaintsForDivision, getPayslipsForUser,
        toggleContentCompletion, toggleBookmark, getProgressForUser,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
