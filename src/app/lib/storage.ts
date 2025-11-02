import { get, set, del, update } from 'idb-keyval'
import { Chunk, LegataFile } from '@/types'

const FILES_KEY = 'legata.files'
const CHUNKS_KEY = 'legata.chunks'

export async function listFiles(): Promise<LegataFile[]> {
  return (await get<LegataFile[]>(FILES_KEY)) || []
}

export async function storeFile(file: LegataFile) {
  const files = await listFiles()
  const existingIdx = files.findIndex(f => f.id === file.id)
  if (existingIdx >= 0) files[existingIdx] = file
  else files.push(file)
  await set(FILES_KEY, files)
}

export async function clearAll() {
  await del(FILES_KEY)
  await del(CHUNKS_KEY)
}

export async function listChunks(): Promise<Chunk[]> {
  return (await get<Chunk[]>(CHUNKS_KEY)) || []
}

export async function storeChunks(newChunks: Chunk[]) {
  const existing = await listChunks()
  const map = new Map(existing.map(c => [c.id, c]))
  for (const c of newChunks) map.set(c.id, c)
  await set(CHUNKS_KEY, Array.from(map.values()))
}

export async function getChunksByFileIds(fileIds: string[]): Promise<Chunk[]> {
  const all = await listChunks()
  return all.filter(c => fileIds.includes(c.fileId))
}

