const demo = [
  { type: "project", title: "Novo projeto criado", meta: "Há 2 horas", border: "border-l-primary" },
  { type: "task", title: "Tarefa atualizada no Kanban", meta: "Ontem", border: "border-l-secondary" },
  { type: "file", title: "Arquivo sincronizado com o Drive", meta: "3 dias", border: "border-l-tertiary-container" },
];

export function ActivityFeed() {
  return (
    <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
      <h2 className="font-headline text-lg font-bold text-on-surface">Feed do escritório</h2>
      <p className="mt-1 text-xs text-on-surface-variant">Atividades recentes da equipe</p>
      <ul className="mt-6 space-y-3">
        {demo.map((item) => (
          <li
            key={item.title}
            className={`rounded-lg border border-outline-variant/10 border-l-4 ${item.border} bg-surface-container-low/40 px-4 py-3`}
          >
            <p className="text-sm font-medium text-on-surface">{item.title}</p>
            <p className="text-xs text-on-surface-variant">{item.meta}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
