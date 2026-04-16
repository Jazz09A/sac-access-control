import { EntryForm } from '@/components/forms/entry-form'

export default function EntryPage() {
  return (
    <div className="p-10 max-w-4xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-7xl font-display font-medium text-foreground tracking-[-0.03em] leading-[0.9]">Registrar Entrada</h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed font-light italic">
          Gestión de ingreso de contribuyentes al establecimiento
        </p>
      </div>

      <EntryForm />
    </div>
  )
}
