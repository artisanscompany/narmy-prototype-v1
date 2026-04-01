export type ClearanceLevel = 'all_ranks' | 'nco_above' | 'officer_above' | 'senior_officer'
export type ContentType = 'curriculum' | 'lecture_notes' | 'training_material'
export type FileFormat = 'pdf' | 'doc' | 'ppt' | 'video'

export interface Department {
  id: string
  name: string
  category: 'core' | 'supporting'
  description: string
  icon: string
  courseCount: number
  trades: string[]
}

export interface Course {
  id: string
  departmentId: string
  title: string
  code: string
  description: string
  objectives: string[]
  assessmentCriteria: string
  clearanceLevel: ClearanceLevel
  contents: CourseContent[]
}

export interface CourseContent {
  id: string
  courseId: string
  title: string
  type: ContentType
  format: FileFormat
  description: string
  clearanceLevel: ClearanceLevel
  fileSize: string
  uploadedBy: string
  uploadDate: string
  pageCount: number
  summary: string
}

export interface CourseProgress {
  userId: string
  courseId: string
  completedContentIds: string[]
  bookmarked: boolean
  lastAccessedDate: string
}
