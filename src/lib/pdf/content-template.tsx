import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { CourseContent, Course } from '#/types/elearning'
import type { User } from '#/types/user'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, position: 'relative' as const },
  watermark: {
    position: 'absolute' as const,
    top: '45%',
    left: '10%',
    right: '10%',
    transform: 'rotate(-35deg)',
    opacity: 0.06,
    fontSize: 48,
    fontFamily: 'Helvetica-Bold',
    color: '#0B2E1A',
    textAlign: 'center' as const,
  },
  watermarkSub: {
    position: 'absolute' as const,
    top: '52%',
    left: '10%',
    right: '10%',
    transform: 'rotate(-35deg)',
    opacity: 0.06,
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0B2E1A',
    textAlign: 'center' as const,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0B2E1A',
    paddingBottom: 12,
  },
  headerLeft: {},
  title: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#0B2E1A' },
  subtitle: { fontSize: 9, color: '#666', marginTop: 2 },
  courseCode: { fontSize: 10, color: '#C8A84B', fontFamily: 'Helvetica-Bold', marginTop: 4 },
  star: { fontSize: 24, color: '#C8A84B', fontFamily: 'Helvetica-Bold' },
  meta: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 12, marginBottom: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#e5e5e5' },
  metaItem: { width: '30%' },
  metaLabel: { fontSize: 7, color: '#999', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  metaValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#0B2E1A', marginTop: 1 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0B2E1A', marginBottom: 8, marginTop: 16 },
  paragraph: { fontSize: 10, color: '#374151', lineHeight: 1.6, marginBottom: 6 },
  heading: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0B2E1A', marginTop: 10, marginBottom: 4 },
  listItem: { fontSize: 10, color: '#374151', lineHeight: 1.6, paddingLeft: 12, marginBottom: 3 },
  downloadInfo: {
    position: 'absolute' as const,
    bottom: 50,
    left: 40,
    right: 40,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    borderTopWidth: 0.5,
    borderTopColor: '#C8A84B',
    paddingTop: 8,
  },
  downloadLabel: { fontSize: 7, color: '#C8A84B' },
  footer: {
    position: 'absolute' as const,
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center' as const,
    fontSize: 7,
    color: '#999',
  },
  classification: {
    textAlign: 'center' as const,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626',
    marginBottom: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 2,
  },
})

const contentTypeLabels: Record<string, string> = {
  curriculum: 'Curriculum / Scheme of Work',
  lecture_notes: 'Lecture Notes',
  training_material: 'Training Material',
}

export function ContentPDF({ content, course, user }: { content: CourseContent; course: Course; user: User }) {
  const downloadDate = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark — user's name diagonally across page */}
        <Text style={styles.watermark}>{user.name}</Text>
        <Text style={styles.watermarkSub}>{user.armyNumber} — {user.rank}</Text>

        {/* Classification banner for restricted content */}
        {content.clearanceLevel !== 'all_ranks' && (
          <View style={styles.classification}>
            <Text>
              {content.clearanceLevel === 'senior_officer' ? 'RESTRICTED' :
               content.clearanceLevel === 'officer_above' ? 'RESTRICTED — OFFICERS ONLY' :
               'RESTRICTED — NCO AND ABOVE'}
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>NASFA — {contentTypeLabels[content.type] ?? content.type}</Text>
            <Text style={styles.subtitle}>{content.title}</Text>
            <Text style={styles.courseCode}>{course.code}: {course.title}</Text>
          </View>
          <Text style={styles.star}>★</Text>
        </View>

        {/* Document metadata */}
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Department</Text>
            <Text style={styles.metaValue}>{course.departmentId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Format</Text>
            <Text style={styles.metaValue}>{content.format.toUpperCase()}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Pages</Text>
            <Text style={styles.metaValue}>{content.pageCount}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Uploaded By</Text>
            <Text style={styles.metaValue}>{content.uploadedBy}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Upload Date</Text>
            <Text style={styles.metaValue}>{content.uploadDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Content ID</Text>
            <Text style={styles.metaValue}>{content.id}</Text>
          </View>
        </View>

        {/* Content body — render summary as structured text */}
        <View>
          {content.summary.split('\n').map((line, i) => {
            const trimmed = line.trim()
            if (trimmed === '') return <View key={i} style={{ height: 6 }} />
            // Section headings (all caps or numbered)
            if (/^\d+\./.test(trimmed) || /^[A-Z][A-Z\s&:—\-()]+$/.test(trimmed)) {
              return <Text key={i} style={styles.heading}>{trimmed}</Text>
            }
            // List items
            if (trimmed.startsWith('-') || trimmed.startsWith('[ ]') || trimmed.startsWith('[')) {
              return <Text key={i} style={styles.listItem}>{trimmed}</Text>
            }
            // Regular paragraph
            return <Text key={i} style={styles.paragraph}>{trimmed}</Text>
          })}
        </View>

        {/* Download info strip — who downloaded this and when */}
        <View style={styles.downloadInfo}>
          <Text style={styles.downloadLabel}>Downloaded by: {user.rank} {user.name} ({user.armyNumber})</Text>
          <Text style={styles.downloadLabel}>{downloadDate}</Text>
        </View>

        <Text style={styles.footer}>
          Nigerian Army School of Finance & Administration (NASFA) — E-Learning Platform. This document is watermarked and traceable.
        </Text>
      </Page>
    </Document>
  )
}
