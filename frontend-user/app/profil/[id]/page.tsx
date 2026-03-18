import { ProfileDetailContent } from "@/components/profile-detail/profile-detail-content"

interface ProfilePageProps {
    params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { id } = await params
    
    return <ProfileDetailContent profileId={id} />
}
