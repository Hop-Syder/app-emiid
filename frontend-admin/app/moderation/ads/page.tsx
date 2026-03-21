import { getAds } from "@/lib/actions/admin"
import { AdsClient } from "@/components/ads-client"

export default async function AdsModerationPage() {
  const adsData = await getAds({ page: 1, limit: 100 })

  return (
    <AdsClient 
      initialAds={adsData.ads} 
      initialTotal={adsData.total}
    />
  )
}
