'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { SearchBar } from '@/components/search/search-bar'
import { ResultsTable } from '@/components/search/results-table'
import { Fiscal, SearchFilters, Visit, VisitHistory, VisitStatus } from '@/types'
import { deleteVisit, getVisit, getVisitsHistory, markVisitAsAttended, registerVisitExit, updateVisit } from '@/services/visits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FiscalSelector } from '@/components/fiscals/fiscal-selector'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { VISIT_REASONS } from '@/utils/constants'
import { toast } from 'sonner'

export default function SearchPage() {
  const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [processingVisitId, setProcessingVisitId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState<VisitHistory | null>(null)
  const [visitToDelete, setVisitToDelete] = useState<VisitHistory | null>(null)
  const [selectedVisitDetail, setSelectedVisitDetail] = useState<Visit | null>(null)
  const [isLoadingVisitDetail, setIsLoadingVisitDetail] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isDeletingVisit, setIsDeletingVisit] = useState(false)
  const [editFiscalId, setEditFiscalId] = useState<number | undefined>(undefined)
  const [selectedFiscal, setSelectedFiscal] = useState<Fiscal | null>(null)
  const [editReason, setEditReason] = useState('')
  const [editObservations, setEditObservations] = useState('')
  const [editReceivedBy, setEditReceivedBy] = useState('')
  const [editDepartment, setEditDepartment] = useState('')
  const [editFileNumber, setEditFileNumber] = useState('')
  const [editEntryDate, setEditEntryDate] = useState('')
  const [editEntryTime, setEditEntryTime] = useState('')
  const [editExitDate, setEditExitDate] = useState('')
  const [editExitTime, setEditExitTime] = useState('')
  const [editStatus, setEditStatus] = useState<VisitStatus>(VisitStatus.WAITING)

  const normalizeTimeForInput = (time?: string) => (time ? time.slice(0, 5) : '')
  const toApiTime = (time: string) => {
    if (!time) return ''
    return time.length === 5 ? `${time}:00` : time
  }

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true)
    try {
      const data = await getVisitsHistory(filters)
      setVisitHistory(data.items || [])
      setTotalCount(data.total || 0)
    } catch (error) {
      console.error('Error fetching visit history:', error)
      // For now, show empty results on error
      setVisitHistory([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsAttended = async (visitId: string) => {
    setProcessingVisitId(visitId)
    try {
      await markVisitAsAttended(visitId)
      toast.success('Visita marcada como atendida')
      // Refresh the search results
      setVisitHistory(prev => prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, estado: VisitStatus.ATTENDED }
          : visit
      ))
    } catch (error) {
      console.error('Error marking as attended:', error)
      toast.error('Error al marcar como atendido')
    } finally {
      setProcessingVisitId(null)
    }
  }

  const handleRegisterExit = async (visitId: string) => {
    setProcessingVisitId(visitId)
    try {
      const now = new Date()
      const exitDate = now.toISOString().split('T')[0]
      const exitTime = now.toTimeString().slice(0, 8)

      await registerVisitExit(visitId, {
        exit_date: exitDate,
        exit_time: exitTime,
        status: VisitStatus.FINISHED
      })
      toast.success('Salida registrada correctamente')
      // Refresh the search results
      setVisitHistory(prev => prev.filter(visit => visit.id !== visitId))
    } catch (error) {
      console.error('Error registering exit:', error)
      toast.error('Error al registrar la salida')
    } finally {
      setProcessingVisitId(null)
    }
  }

  const handleOpenEditModal = async (visit: VisitHistory) => {
    setSelectedVisit(visit)
    setIsEditModalOpen(true)
    setIsLoadingVisitDetail(true)

    try {
      const visitDetail = await getVisit(visit.id)
      setSelectedVisitDetail(visitDetail)
      setEditFiscalId(visitDetail.fiscal_id)
      setEditReason(visitDetail.reason || '')
      setEditObservations(visitDetail.observations || '')
      setEditReceivedBy(visitDetail.received_by || '')
      setEditDepartment(visitDetail.department || '')
      setEditFileNumber(visitDetail.file_number || '')
      setEditEntryDate(visitDetail.entry_date || '')
      setEditEntryTime(normalizeTimeForInput(visitDetail.entry_time))
      setEditExitDate(visitDetail.exit_date || '')
      setEditExitTime(normalizeTimeForInput(visitDetail.exit_time))
      setEditStatus(visitDetail.status || visit.estado)
    } catch (error) {
      console.error('Error loading visit detail:', error)
      toast.error('Error al cargar la visita para editar')
      handleCloseEditModal()
    } finally {
      setIsLoadingVisitDetail(false)
    }
  }

  const handleCloseEditModal = () => {
    if (isSavingEdit) return

    setIsEditModalOpen(false)
    setSelectedVisit(null)
    setSelectedVisitDetail(null)
    setIsLoadingVisitDetail(false)
    setEditFiscalId(undefined)
    setSelectedFiscal(null)
    setEditReason('')
    setEditObservations('')
    setEditReceivedBy('')
    setEditDepartment('')
    setEditFileNumber('')
    setEditEntryDate('')
    setEditEntryTime('')
    setEditExitDate('')
    setEditExitTime('')
    setEditStatus(VisitStatus.WAITING)
  }

  const handleSaveVisitEdit = async () => {
    if (!selectedVisit || isSavingEdit) return

    const trimmedReason = editReason.trim()
    if (!trimmedReason) {
      toast.error('El motivo es obligatorio')
      return
    }
    if (!editFiscalId || editFiscalId <= 0) {
      toast.error('Debes seleccionar un fiscal valido')
      return
    }

    setIsSavingEdit(true)
    setProcessingVisitId(selectedVisit.id)

    try {
      const payload = {
        fiscal_id: String(editFiscalId),
        reason: trimmedReason,
        observations: editObservations.trim() || undefined,
        received_by: editReceivedBy.trim() || undefined,
        department: editDepartment.trim(),
        file_number: editFileNumber.trim(),
        entry_date: editEntryDate || undefined,
        entry_time: toApiTime(editEntryTime) || undefined,
        exit_date: editExitDate || undefined,
        exit_time: toApiTime(editExitTime) || undefined,
        status: editStatus,
      }

      await updateVisit(selectedVisit.id, payload)

      setVisitHistory(prev =>
        prev.map(visit =>
          visit.id === selectedVisit.id
            ? {
                ...visit,
                motivo: trimmedReason,
                depto: editDepartment.trim(),
                registro: editFileNumber.trim() || null,
                estado: editStatus,
              }
            : visit,
        ),
      )

      toast.success('Visita actualizada correctamente')
      handleCloseEditModal()
    } catch (error) {
      console.error('Error updating visit:', error)
      toast.error('Error al actualizar la visita')
    } finally {
      setIsSavingEdit(false)
      setProcessingVisitId(null)
    }
  }

  const handleFiscalSelect = (fiscal: Fiscal) => {
    setSelectedFiscal(fiscal)
    setEditFiscalId(fiscal.id)
  }

  const handleOpenDeleteModal = (visit: VisitHistory) => {
    setVisitToDelete(visit)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    if (isDeletingVisit) return
    setIsDeleteModalOpen(false)
    setVisitToDelete(null)
  }

  const handleDeleteVisit = async () => {
    if (!visitToDelete || isDeletingVisit) return

    setIsDeletingVisit(true)
    setProcessingVisitId(visitToDelete.id)
    try {
      await deleteVisit(visitToDelete.id)
      setVisitHistory((prev) => prev.filter((visit) => visit.id !== visitToDelete.id))
      setTotalCount((prev) => Math.max(0, prev - 1))
      toast.success('Visita eliminada correctamente')
      handleCloseDeleteModal()
    } catch (error) {
      console.error('Error deleting visit:', error)
      toast.error('Error al eliminar la visita')
    } finally {
      setIsDeletingVisit(false)
      setProcessingVisitId(null)
    }
  }

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-7xl font-display font-medium text-foreground tracking-[-0.03em] leading-[0.9]">Historial de Visitas</h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed font-light italic">
          Búsqueda avanzada y análisis de registros de contribuyentes
        </p>
      </div>

      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      <ResultsTable
        visits={visitHistory}
        isLoading={isLoading}
        totalCount={totalCount}
        processingVisitId={processingVisitId}
        onEditVisit={handleOpenEditModal}
        onDeleteVisit={handleOpenDeleteModal}
        onMarkAsAttended={handleMarkAsAttended}
        onRegisterExit={handleRegisterExit}
      />

      <Dialog open={isEditModalOpen} onOpenChange={(open) => !open && handleCloseEditModal()}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] rounded-lg p-0 sm:w-full sm:max-w-2xl md:max-w-3xl max-h-[92vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="px-4 pt-4 sm:px-6 sm:pt-6">Editar visita</DialogTitle>
            <DialogDescription className="px-4 sm:px-6">
              Actualiza los datos necesarios y guarda los cambios de forma segura.
            </DialogDescription>
          </DialogHeader>

          {isLoadingVisitDetail ? (
            <div className="py-10 px-4 sm:px-6 flex items-center justify-center text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando datos de la visita...
            </div>
          ) : (
            <div className="grid gap-4 px-4 py-2 sm:px-6 max-h-[66vh] overflow-y-auto pb-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-fiscal-id">Fiscal responsable</Label>
                <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Fiscal asignado actualmente
                  </p>
                  <p className="font-medium">
                    {selectedVisitDetail?.fiscal_name || 'No disponible'}{' '}
                    <span className="text-muted-foreground">
                      (ID: {selectedVisitDetail?.fiscal_id ?? 'N/A'})
                    </span>
                  </p>
                </div>
                <FiscalSelector
                  value={editFiscalId}
                  onSelect={handleFiscalSelect}
                  placeholder="Buscar y seleccionar fiscal..."
                  disabled={isSavingEdit}
                />
                {selectedFiscal && (
                  <p className="text-xs text-muted-foreground">
                    Seleccionado: {selectedFiscal.name} (ID: {selectedFiscal.id})
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-reason">Motivo</Label>
                <Select
                  value={editReason}
                  onValueChange={setEditReason}
                  disabled={isSavingEdit}
                >
                  <SelectTrigger id="edit-reason" className="w-full">
                    <SelectValue placeholder="Seleccionar motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIT_REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-observations">Observaciones</Label>
                <Textarea
                  id="edit-observations"
                  value={editObservations}
                  onChange={(e) => setEditObservations(e.target.value)}
                  placeholder="Observaciones adicionales"
                  className="min-h-20"
                  disabled={isSavingEdit}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-received-by">Recibido por</Label>
                <Input
                  id="edit-received-by"
                  value={editReceivedBy}
                  onChange={(e) => setEditReceivedBy(e.target.value)}
                  placeholder="Nombre del receptor"
                  disabled={isSavingEdit}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-department">Departamento</Label>
                  <Input
                    id="edit-department"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="Ej: Fiscalizacion"
                    disabled={isSavingEdit}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-file-number">Numero de registro</Label>
                  <Input
                    id="edit-file-number"
                    value={editFileNumber}
                    onChange={(e) => setEditFileNumber(e.target.value)}
                    placeholder="Ej: EXP-2026-00045"
                    disabled={isSavingEdit}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-entry-date">Fecha de entrada</Label>
                  <Input
                    id="edit-entry-date"
                    type="date"
                    value={editEntryDate}
                    onChange={(e) => setEditEntryDate(e.target.value)}
                    disabled={isSavingEdit}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-entry-time">Hora de entrada</Label>
                  <Input
                    id="edit-entry-time"
                    type="time"
                    step={1}
                    value={editEntryTime}
                    onChange={(e) => setEditEntryTime(e.target.value)}
                    disabled={isSavingEdit}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-exit-date">Fecha de salida</Label>
                  <Input
                    id="edit-exit-date"
                    type="date"
                    value={editExitDate}
                    onChange={(e) => setEditExitDate(e.target.value)}
                    disabled={isSavingEdit}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-exit-time">Hora de salida</Label>
                  <Input
                    id="edit-exit-time"
                    type="time"
                    step={1}
                    value={editExitTime}
                    onChange={(e) => setEditExitTime(e.target.value)}
                    disabled={isSavingEdit}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select
                  value={editStatus}
                  onValueChange={(value) => setEditStatus(value as VisitStatus)}
                  disabled={isSavingEdit}
                >
                  <SelectTrigger id="edit-status" className="w-full">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={VisitStatus.WAITING}>En espera</SelectItem>
                    <SelectItem value={VisitStatus.ATTENDED}>Atendido</SelectItem>
                    <SelectItem value={VisitStatus.FINISHED}>Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="border-t px-4 py-3 sm:px-6 bg-background">
            <Button className="w-full sm:w-auto" variant="outline" onClick={handleCloseEditModal} disabled={isSavingEdit}>
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handleSaveVisitEdit}
              disabled={isSavingEdit || isLoadingVisitDetail || !editReason.trim() || !selectedVisit || !selectedVisitDetail}
            >
              {isSavingEdit ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDeleteModal()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar visita</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción aplica un borrado lógico y ocultará la visita en listados/reportes.
              {visitToDelete && (
                <span className="mt-2 block text-foreground">
                  Contribuyente: <strong>{visitToDelete.contribuyente}</strong>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingVisit}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVisit}
              disabled={isDeletingVisit}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeletingVisit ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar visita'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
