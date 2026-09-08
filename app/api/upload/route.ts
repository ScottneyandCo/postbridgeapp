import { put, del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { isAcceptedMediaType, MAX_MEDIA_BYTES, type MediaItem } from "@/lib/media"

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  return session.user.id
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!isAcceptedMediaType(file.type)) {
      return NextResponse.json({ error: "Only images and videos are allowed" }, { status: 415 })
    }
    if (file.size > MAX_MEDIA_BYTES) {
      return NextResponse.json({ error: "File is larger than 25 MB" }, { status: 413 })
    }

    // Scope uploads under the user's folder with a random suffix to avoid clashes.
    const blob = await put(`posts/${userId}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    })

    const item: MediaItem = {
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      name: file.name,
      size: file.size,
    }
    return NextResponse.json(item)
  } catch (error) {
    console.log("[v0] upload error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { url } = await request.json()
    if (typeof url !== "string" || !url) {
      return NextResponse.json({ error: "No url provided" }, { status: 400 })
    }
    // Only allow deleting blobs from this user's own folder.
    if (!url.includes(`/posts/${userId}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await del(url)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.log("[v0] delete media error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
