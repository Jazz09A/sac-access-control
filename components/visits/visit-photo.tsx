import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera } from 'lucide-react'

interface VisitPhotoProps {
  photoUrl?: string
  contributorName: string
}

export function VisitPhoto({ photoUrl, contributorName }: VisitPhotoProps) {
  if (!photoUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Fotografía
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No hay fotografía disponible
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Fotografía
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
          <Image
            src={photoUrl}
            alt={`Foto de ${contributorName}`}
            fill
            className="object-cover"
          />
        </div>
      </CardContent>
    </Card>
  )
}
