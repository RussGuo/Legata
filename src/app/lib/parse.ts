import { LegataFile } from '@/types'

function fileTypeFromName(name: string): 'pdf'|'docx'|'txt'|'md' {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx') return 'docx'
  if (ext === 'md') return 'md'
  return 'txt'
}

export async function parseFiles(fileList: FileList): Promise<LegataFile[]> {
  const parsed: LegataFile[] = []
  for (const f of Array.from(fileList)) {
    const id = crypto.randomUUID()
    const type = fileTypeFromName(f.name)
    let text = ''
    try {
      if (type === 'txt' || type === 'md') {
        text = await f.text()
      } else if (type === 'pdf') {
        text = await parsePDF(await f.arrayBuffer())
      } else if (type === 'docx') {
        text = await parseDOCX(await f.arrayBuffer())
      }
    } catch (e) {
      text = ''
      console.warn('Parse failed:', e)
    }
    parsed.push({ id, name: f.name, type, size: f.size, text, addedAt: Date.now() })
  }
  return parsed
}

async function parsePDF(buf: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  const loadingTask = (pdfjs as any).getDocument({ data: buf })
  const pdf = await loadingTask.promise
  const max = Math.min(pdf.numPages, 50) // simple cap
  let text = ''
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map((it: any) => ('str' in it ? it.str : '')).join(' ')
    text += `\n\n[[PAGE ${i}]]\n` + pageText
  }
  return text
}

async function parseDOCX(buf: ArrayBuffer): Promise<string> {
  const mammoth = await import('mammoth')
  const { value } = await (mammoth as any).extractRawText({ arrayBuffer: buf })
  return value
}
