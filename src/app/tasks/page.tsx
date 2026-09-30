export default function TasksPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cola de Tareas</h1>
        <p className="text-muted-foreground mt-1">Monitoreo de tareas pendientes, en proceso y completadas.</p>
      </div>
      <div className="border border-border bg-card rounded-lg p-8 flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground">Próximamente: Historial y asignación manual de tareas.</p>
      </div>
    </div>
  );
}
