'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface PhotoUploadProps {
  onPhotoSelect: (photoUrl: string) => void
  value?: string
  label?: string
  required?: boolean
}

export function PhotoUpload({
  onPhotoSelect,
  value,
  label = 'Foto del Contribuyente',
  required = false
}: PhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor seleccione un archivo de imagen válido')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe exceder 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      setPreviewUrl(url)
      onPhotoSelect(url)
      toast.success('Foto cargada correctamente')
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const clearPhoto = () => {
    setPreviewUrl(undefined)
    onPhotoSelect('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {previewUrl ? (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
              <Image
                src={previewUrl}
                alt="Foto del contribuyente"
                fill
                className="object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={clearPhoto}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Eliminar Foto
            </Button>
          </div>
        </Card>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/30 hover:bg-muted/50'
          }`}
        >
          <div className="space-y-3">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">
                Arrastre una imagen aquí o use los botones
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PNG, JPG, GIF hasta 5MB
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar Archivo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                Tomar Foto
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Cargar imagen"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
            aria-label="Capturar foto con cámara"
          />
        </div>
      )}
    </div>
  )
}
