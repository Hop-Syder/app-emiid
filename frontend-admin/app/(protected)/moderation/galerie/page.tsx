import { getGalleryItems } from "@/lib/actions/admin"
import { GalleryModerationClient } from "@/components/gallery-moderation-client"

export default async function GalleryModerationPage() {
  const items = await getGalleryItems()

  return <GalleryModerationClient initialItems={items} />
}
