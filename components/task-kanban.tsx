"use client";

import { useState } from "react";
import { CalendarDays, GripVertical, UserRound } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Task, TaskStatus } from "@/types/domain";

const columns: { status: TaskStatus; label: string; tone: string }[] = [
  { status: "TODO", label: "À faire", tone: "border-slate-200" },
  { status: "IN_PROGRESS", label: "En cours", tone: "border-blue-200" },
  { status: "BLOCKED", label: "Bloquées", tone: "border-red-200" },
  { status: "DONE", label: "Terminées", tone: "border-emerald-200" },
];

interface TaskKanbanProps {
  tasks: Task[];
  onStatusChange: (task: Task, status: TaskStatus) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskKanban({ tasks, onStatusChange, onEdit, onDelete }: TaskKanbanProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropStatus, setActiveDropStatus] = useState<TaskStatus | null>(null);

  return <div className="mb-6 grid gap-3 xl:grid-cols-4">
    {columns.map((column) => {
      const columnTasks = tasks.filter((task) => task.status === column.status);
      return <section className={`min-h-48 rounded-xl border bg-panel p-3 transition ${column.tone} ${activeDropStatus === column.status ? "ring-2 ring-accent-400" : ""}`} key={column.status} onDragOver={(event) => { event.preventDefault(); setActiveDropStatus(column.status); }} onDragLeave={() => setActiveDropStatus(null)} onDrop={(event) => { event.preventDefault(); const task = tasks.find((item) => item.id === draggedTaskId); setActiveDropStatus(null); setDraggedTaskId(null); if (task && task.status !== column.status) void onStatusChange(task, column.status); }}>
        <div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-xs font-bold uppercase tracking-[.1em] text-ink">{column.label}</h3><span className="grid h-6 min-w-6 place-items-center rounded-full bg-white px-2 text-[11px] font-bold text-muted">{columnTasks.length}</span></div>
        <div className="space-y-2">
          {columnTasks.map((task) => <article className="cursor-grab rounded-lg border border-line bg-white p-3 shadow-sm active:cursor-grabbing" draggable onDragStart={() => setDraggedTaskId(task.id)} onDragEnd={() => { setDraggedTaskId(null); setActiveDropStatus(null); }} key={task.id}>
            <div className="flex items-start gap-2"><GripVertical className="mt-0.5 shrink-0 text-muted" size={14} /><strong className="min-w-0 flex-1 text-xs leading-5 text-ink">{task.title}</strong><span className={`h-2 w-2 shrink-0 rounded-full ${task.priority === "HIGH" ? "bg-danger" : task.priority === "MEDIUM" ? "bg-accent-400" : "bg-slate-300"}`} title={`Priorité ${task.priority}`} /></div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted">{task.assignee?.email && <span className="inline-flex max-w-full items-center gap-1 truncate"><UserRound size={11} /> {task.assignee.email}</span>}{task.deadline && <span className="inline-flex items-center gap-1"><CalendarDays size={11} /> {formatDate(task.deadline)}</span>}</div>
            <div className="mt-3 flex justify-end gap-2"><button type="button" className="text-[10px] font-semibold text-muted hover:text-brand-900" onClick={() => onEdit(task)}>Modifier</button><button type="button" className="text-[10px] font-semibold text-danger hover:underline" onClick={() => onDelete(task)}>Supprimer</button></div>
            <label className="sr-only">Changer le statut de {task.title}<select value={task.status} onChange={(event) => void onStatusChange(task, event.target.value as TaskStatus)}><option value="TODO">À faire</option><option value="IN_PROGRESS">En cours</option><option value="BLOCKED">Bloquée</option><option value="DONE">Terminée</option></select></label>
          </article>)}
          {columnTasks.length === 0 && <p className="rounded-lg border border-dashed border-line px-3 py-5 text-center text-xs text-muted">Déposer une tâche ici</p>}
        </div>
      </section>;
    })}
  </div>;
}
