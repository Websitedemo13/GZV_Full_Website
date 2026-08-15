import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/supabase-storage'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const folder = searchParams.get('folder') || 'site'
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    const files: Array<{
      name: string
      url: string
      size: number
      mimetype: string
      path: string
    }> = []

    // 1. Scan Backend public/ folder
    const targetDir = path.join(process.cwd(), 'public', folder)
    if (fs.existsSync(targetDir)) {
      const dirEntries = fs.readdirSync(targetDir, { withFileTypes: true })
      for (const entry of dirEntries) {
        if (entry.isFile() && /\.(png|jpe?g|webp|gif|svg|avif|mp4|webm|ogg|mov)$/i.test(entry.name)) {
          const filePath = path.join(targetDir, entry.name)
          const stats = fs.statSync(filePath)
          files.push({
            name: entry.name,
            url: `/${folder}/${entry.name}`,
            size: stats.size,
            mimetype: entry.name.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
            path: `${folder}/${entry.name}`,
          })
        }
      }
    }

    // 2. Also scan root public/ if folder is 'site' or 'root'
    if (folder === 'site') {
      const rootDir = path.join(process.cwd(), 'public')
      if (fs.existsSync(rootDir)) {
        const rootEntries = fs.readdirSync(rootDir, { withFileTypes: true })
        for (const entry of rootEntries) {
          if (entry.isFile() && /\.(png|jpe?g|webp|gif|svg|avif|mp4|webm|ogg|mov)$/i.test(entry.name)) {
            const filePath = path.join(rootDir, entry.name)
            const stats = fs.statSync(filePath)
            files.push({
              name: entry.name,
              url: `/${entry.name}`,
              size: stats.size,
              mimetype: entry.name.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
              path: `site/${entry.name}`,
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        files: files.slice(0, limit),
        total: files.length,
      },
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch media files',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'uploads'
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!file) {
      return NextResponse.json({ success: false, error: 'File là bắt buộc' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type) && !/\.(png|jpe?g|webp|gif|svg|avif|mp4|webm|ogg|mov)$/i.test(file.name)) {
      return NextResponse.json({ success: false, error: `Định dạng ${file.type} không được hỗ trợ` }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'Dung lượng file vượt quá giới hạn 50MB' }, { status: 400 })
    }

    // 1. Try Supabase Storage first if token exists
    if (token) {
      try {
        const result = await uploadFile(file, folder, token)
        if (result.success && result.data) {
          return NextResponse.json(result)
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, saving to local public folder:', err)
      }
    }

    // 2. Local File System Storage (Backend public/ and Frontend public/)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const safeName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
    const fileName = `${Date.now()}_${safeName}`

    // Destination in Backend public
    const backendTargetDir = path.join(process.cwd(), 'public', folder)
    if (!fs.existsSync(backendTargetDir)) {
      fs.mkdirSync(backendTargetDir, { recursive: true })
    }
    const backendFilePath = path.join(backendTargetDir, fileName)
    fs.writeFileSync(backendFilePath, new Uint8Array(arrayBuffer))

    // Sync to Frontend public folder if exists
    const frontendPublicDir = path.join(process.cwd(), '../Frontend_GZV/public', folder)
    try {
      if (!fs.existsSync(frontendPublicDir)) {
        fs.mkdirSync(frontendPublicDir, { recursive: true })
      }
      fs.writeFileSync(path.join(frontendPublicDir, fileName), new Uint8Array(arrayBuffer))
    } catch (e) {
      console.warn('Could not sync to Frontend public dir:', e)
    }

    const publicUrl = `/${folder}/${fileName}`

    return NextResponse.json({
      success: true,
      data: {
        id: fileName,
        name: file.name,
        url: publicUrl,
        size: file.size,
        mimetype: file.type,
        path: `${folder}/${fileName}`,
        created_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Không thể tải ảnh lên',
        message: error instanceof Error ? error.message : 'Lỗi không xác định',
      },
      { status: 500 }
    )
  }
}
