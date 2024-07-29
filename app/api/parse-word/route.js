import { NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(request) {
  const data = await request.formData()
  const file = data.get('file')

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return NextResponse.json({ content: result.value })
  } catch (error) {
    console.error('Error parsing Word document:', error)
    return NextResponse.json({ error: 'Failed to parse Word document' }, { status: 500 })
  }
}