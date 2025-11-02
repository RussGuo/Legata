export type FileType = 'pdf' | 'docx' | 'txt' | 'md'

export interface LegataFile {
  id: string
  name: string
  type: FileType
  size: number
  pages?: number
  outline?: OutlineItem[]
  text?: string
  addedAt: number
}

export interface OutlineItem { title: string; pageStart?: number; level: number }

export interface Chunk { id: string; fileId: string; text: string; page?: number; start: number; end: number; embedding?: number[] }

export interface Retrieval { chunkId: string; score: number }

export interface AnswerSentence { text: string; citations: {fileId: string; page?: number; start: number; end: number;}[] }

export interface DiffUnit { clause: string; location: string; before: string; after: string; type: 'add'|'delete'|'modify'; risk?: string; suggestion?: string }

