/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Page de connexion social media
 * @created 2025-12-24
 * @updated 2025-12-26
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
*/

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4">
      <Card className="w-full max-w-md rounded-3xl border-none shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
        <CardHeader className="relative space-y-2 text-center pb-8 border-b bg-white/50">
          <div className="flex justify-center mb-4">
            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
              <Globe className="size-6" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">Nexus Connect</CardTitle>
          <CardDescription className="text-base font-medium">
            Le réseau des entrepreneurs d'Afrique de l'Ouest
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4 pt-8 bg-white/80">
          <div className="grid gap-4">
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full justify-start h-12 text-base font-semibold rounded-2xl border-muted-foreground/20 hover:bg-primary/5 transition-all">
                <img src="https://www.google.com/favicon.ico" className="mr-3 h-5 w-5" alt="Google" />
                Continuer avec Google
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full justify-start h-12 text-base font-semibold rounded-2xl border-muted-foreground/20 hover:bg-primary/5 transition-all">
                <img src="https://www.linkedin.com/favicon.ico" className="mr-3 h-5 w-5" alt="LinkedIn" />
                Continuer avec LinkedIn
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full justify-start h-12 text-base font-semibold rounded-2xl border-muted-foreground/20 hover:bg-primary/5 transition-all">
                <img src="https://www.apple.com/favicon.ico" className="mr-3 h-5 w-5" alt="iCloud" />
                Continuer avec iCloud
              </Button>
            </Link>
          </div>

          <div className="relative pt-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-muted-foreground font-bold">
                Nexus Partners Excellence
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground pt-2">
            En continuant, vous acceptez nos{" "}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">
              Conditions d'utilisation
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Branding footer */}
      <div className="fixed bottom-6 text-white/60 text-sm font-medium">
        © 2025 Nexus Partners • Propulsion Économique
      </div>
    </div>
  )
}
