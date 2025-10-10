import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import { CheckCircle2, ClipboardList, Loader2, Trash } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  completed: number;
  created_at: string;
}

const Tasks = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');

  const { data: tasks = [], isFetching } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => invoke<Task[]>('list_tasks'),
  });

  const createTask = useMutation({
    mutationFn: (payload: { title: string }) => invoke('create_task', { title: payload.title }),
    onSuccess: () => {
      setTitle('');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const toggleTask = useMutation({
    mutationFn: (payload: { id: number; completed: boolean }) =>
      invoke('toggle_task', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id: number) => invoke('delete_task', { id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    await createTask.mutateAsync({ title: title.trim() });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <ClipboardList className="text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Tareas y Actividad</h2>
          <p className="text-sm text-muted-foreground">Registra pendientes y actividades críticas de TI.</p>
        </div>
      </header>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nueva tarea"
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-card outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110"
        >
          Agregar
        </button>
      </form>
      <div className="space-y-3">
        {isFetching && <Loader2 className="animate-spin text-muted-foreground" />}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-card"
          >
            <button
              onClick={() =>
                toggleTask.mutate({ id: task.id, completed: task.completed === 1 ? false : true })
              }
              className="flex items-center gap-2"
            >
              <CheckCircle2
                className={task.completed ? 'text-primary' : 'text-muted-foreground'}
                size={18}
              />
              <span className={task.completed ? 'line-through text-muted-foreground' : ''}>{task.title}</span>
            </button>
            <button onClick={() => deleteTask.mutate(task.id)} className="text-muted-foreground hover:text-red-400">
              <Trash size={16} />
            </button>
          </div>
        ))}
        {!tasks.length && !isFetching && (
          <p className="text-sm text-muted-foreground">No hay tareas registradas aún.</p>
        )}
      </div>
    </div>
  );
};

export default Tasks;
