"use client"

import { ProfileStats } from "./profile-stats"
import { ProfileCard, ProfileData } from "./profile-card"

export function FollowedProfilesContent() {
    const followedProfiles: ProfileData[] = []

    const totalUpdates = followedProfiles.reduce((acc, p) => acc + p.newUpdates, 0)
    const activeToday = followedProfiles.filter((p) => p.lastActive.includes("h")).length

    return (
        <div className="space-y-6">
            <ProfileStats
                total={followedProfiles.length}
                updates={totalUpdates}
                activeToday={activeToday}
            />

            <div className="space-y-4">
                {followedProfiles.length > 0 ? (
                    followedProfiles.map((profile) => (
                        <ProfileCard key={profile.name} profile={profile} />
                    ))
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Vous ne suivez aucun profil pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
