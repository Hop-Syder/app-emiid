import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return new Response('Profile ID is required', { status: 400 })
    }

    // Since this is an edge function, we use the standard supabase-js client
    // Note: We only need public data for the OG image
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, role, specialty, avatar_url, city')
      .eq('id', id)
      .single()

    if (!profile) {
      return new Response('Profile not found', { status: 404 })
    }

    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Membre Nexus'
    const role = profile.role || 'Professionnel'
    const specialty = profile.specialty || 'Réseau Pan-Africain'
    const location = profile.city ? `${profile.city}, Afrique` : 'Afrique'
    const avatarUrl = profile.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#022753', // Nexus dark blue
            backgroundImage: 'linear-gradient(to bottom right, #022753 0%, #011833 100%)',
            padding: '80px',
            position: 'relative',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            backgroundColor: 'rgba(206, 17, 38, 0.15)', // Nexus red accent
            borderRadius: '50%',
            filter: 'blur(80px)',
          }} />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: '40px',
          }} >
            <div style={{ 
              display: 'flex', 
              color: 'white', 
              fontSize: '32px', 
              fontWeight: 900, 
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              NEXUS <span style={{ color: '#CE1126', marginLeft: '10px' }}>CONNECT</span>
            </div>
            <div style={{
              display: 'flex',
              padding: '10px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
            }}>
              PROFIL PREMIUM
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '50px', width: '100%', zIndex: 10 }}>
            {/* Avatar */}
            <div style={{ display: 'flex' }}>
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{
                  width: '280px',
                  height: '280px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '8px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}
              />
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h1 style={{
                fontSize: '80px',
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.1,
                margin: '0 0 20px 0',
                letterSpacing: '-2px',
              }}>
                {fullName}
              </h1>
              
              <p style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#CE1126',
                margin: '0 0 10px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {role}
              </p>

              <p style={{
                fontSize: '28px',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: '0 0 30px 0',
              }}>
                Expertise en {specialty}
              </p>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  padding: '10px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  📍 {location}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            position: 'absolute',
            bottom: '40px',
            right: '80px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '24px',
            fontWeight: 'bold',
          }}>
            nexus-connect.africa
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error(e)
    return new Response('Failed to generate image', { status: 500 })
  }
}
