'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, Camera, X, Check, RefreshCcw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface PhotoUploadProps {
  onPhotoSelect: (photoUrl: string) => void
  value?: string
  label?: string
  required?: boolean
}

interface CameraDevice {
  deviceId: string
  label: string
}

const VDO_NINJA_ROOM_URL =
  'https://vdo.ninja/?director=sac_access&password=seniat2026%24'

export function PhotoUpload({
  onPhotoSelect,
  value,
  label = 'Foto del Contribuyente',
  required = false
}: PhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value)
  const [isDragging, setIsDragging] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isStartingCamera, setIsStartingCamera] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [cameraDevices, setCameraDevices] = useState<CameraDevice[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>('')
  const [activeCameraLabel, setActiveCameraLabel] = useState<string>('')
  const [cameraMode, setCameraMode] = useState<'local' | 'vdo'>('local')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

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

  const loadCameraDevices = async (): Promise<CameraDevice[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices
        .filter((device) => device.kind === 'videoinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camara ${index + 1}`,
        }))
      setCameraDevices(videoDevices)
      return videoDevices
    } catch (error) {
      console.error('[camera] Error listando cámaras:', error)
      toast.error('No se pudieron listar las cámaras disponibles')
      return []
    }
  }

  const startCamera = async (deviceId?: string) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Tu navegador no soporta acceso a cámara')
      return
    }

    try {
      setCameraMode('local')
      setIsStartingCamera(true)
      setIsVideoReady(false)

      // Cerrar stream previo antes de abrir otro dispositivo.
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop()
        }
        streamRef.current = null
      }

      const candidates: MediaStreamConstraints[] = [
        {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          },
          audio: false,
        },
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          },
          audio: false,
        },
        {
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
          audio: false,
        },
      ]

      let mediaStream: MediaStream | null = null
      let lastError: unknown = null
      for (const constraints of candidates) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
          break
        } catch (error) {
          lastError = error
        }
      }

      if (!mediaStream) {
        throw lastError ?? new Error('No se pudo iniciar la cámara')
      }

      streamRef.current = mediaStream
      setIsCameraOpen(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadeddata = () => {
          setIsVideoReady(true)
        }
        await videoRef.current.play()
      }

      const devices = await loadCameraDevices()
      const activeTrack = mediaStream.getVideoTracks()[0]
      const activeDeviceId = activeTrack?.getSettings().deviceId ?? deviceId ?? ''
      const activeDevice = devices.find((camera) => camera.deviceId === activeDeviceId)
      setSelectedCameraId(activeDeviceId)
      setActiveCameraLabel(activeDevice?.label ?? activeTrack?.label ?? 'Camara activa')
    } catch (error) {
      console.error('[camera] Error al iniciar la cámara:', error)
      toast.error('No se pudo acceder a la cámara. Verifica permisos y dispositivo.')
      setIsCameraOpen(false)
    } finally {
      setIsStartingCamera(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop()
      }
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraOpen(false)
    setIsVideoReady(false)
    setActiveCameraLabel('')
  }

  const openVdoNinja = () => {
    stopCamera()
    setCameraMode('vdo')
    setIsCameraOpen(true)
  }

  const captureFromCamera = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) {
      toast.error('No se pudo capturar la imagen')
      return
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('La cámara aún no está lista')
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    if (!context) {
      toast.error('No se pudo procesar la imagen')
      return
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const url = canvas.toDataURL('image/jpeg', 0.92)
    setPreviewUrl(url)
    onPhotoSelect(url)
    stopCamera()
    toast.success('Foto capturada correctamente')
  }

  const clearPhoto = () => {
    setPreviewUrl(undefined)
    onPhotoSelect('')
    stopCamera()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }

  const openCameraWithSelector = async () => {
    await startCamera(selectedCameraId || undefined)
  }

  const switchCamera = async (deviceId: string) => {
    setSelectedCameraId(deviceId)
    await startCamera(deviceId)
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
        <div className="space-y-3">
          {isCameraOpen ? (
            <Card className="p-4">
              {cameraMode === 'vdo' ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Fuente VDO.Ninja activa
                    </p>
                    <p className="text-sm text-foreground">
                      Room: sac_access
                    </p>
                  </div>
                  <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-border/70 bg-muted">
                    {/* <iframe
                      src={VDO_NINJA_ROOM_URL}
                      title="VDO Ninja Room"
                      className="h-full w-full"
                      allow="camera; microphone; autoplay; fullscreen"
                    /> */}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(VDO_NINJA_ROOM_URL, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir en pestaña
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => startCamera(selectedCameraId || undefined)}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Usar camara local
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={stopCamera}
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Camara activa
                      </p>
                      <p className="text-sm text-foreground">
                        {activeCameraLabel || 'Camara en uso'}
                      </p>
                    </div>
                    {cameraDevices.length > 0 && (
                      <Select value={selectedCameraId} onValueChange={switchCamera}>
                        <SelectTrigger className="w-full sm:w-[280px]">
                          <SelectValue placeholder="Seleccionar camara" />
                        </SelectTrigger>
                        <SelectContent>
                          {cameraDevices.map((camera) => (
                            <SelectItem key={camera.deviceId} value={camera.deviceId}>
                              {camera.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-border/70 bg-muted">
                    <video
                      ref={videoRef}
                      className="h-full w-full object-cover"
                      playsInline
                      muted
                      autoPlay
                    />
                    {!isVideoReady && (
                      <div className="absolute inset-0 grid place-items-center bg-background/60 text-center">
                        <p className="px-4 text-sm text-muted-foreground">
                          Conectando camara... si no aparece imagen, prueba Reintentar.
                        </p>
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={captureFromCamera}
                      disabled={!isVideoReady}
                      className="flex-1"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Capturar foto
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openCameraWithSelector}
                      disabled={isStartingCamera}
                      className="flex-1"
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Reintentar
                    </Button>
                    {/* <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openVdoNinja}
                      className="flex-1"
                    >
                      VDO.Ninja
                    </Button> */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={stopCamera}
                      className="flex-1"
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              )}
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
                <div className="flex flex-wrap gap-2 justify-center">
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
                    disabled={isStartingCamera}
                    onClick={openCameraWithSelector}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {isStartingCamera ? 'Abriendo cámara...' : 'Tomar Foto'}
                  </Button>
                  {/* <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openVdoNinja}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    VDO.Ninja
                  </Button> */}
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Cargar imagen"
          />
          {/* Fallback para móviles/navegadores que prefieren input capture */}
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
