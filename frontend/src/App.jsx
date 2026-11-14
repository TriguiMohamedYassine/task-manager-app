import React, { useState, useEffect } from 'react';

const STATUS_OPTIONS = ['à faire', 'en cours', 'terminée'];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('à faire');

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Impossible de charger les tâches');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }
      setTitle('');
      setDescription('');
      setStatus('à faire');
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Erreur lors de la modification du statut');
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Confirmer la suppression de cette tâche ?')) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      setEditingTaskId(null);
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const getBadgeClass = (s) => {
    if (s === 'en cours') return 'badge-progress';
    if (s === 'terminée') return 'badge-done';
    return 'badge-todo';
  };

  return (
    <div className="container">
      <header>
        <h1>Task Manager</h1>
        <p>DevOps GitOps Pipeline — Spring Boot & React</p>
      </header>

      <section className="card">
        <h2>Ajouter une nouvelle tâche</h2>
        <form onSubmit={handleCreateTask} style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label>Titre *</label>
            <input
              type="text"
              placeholder="Ex: Mettre en place le pipeline Jenkins"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="3"
              placeholder="Détails de la tâche..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Statut initial</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary">
            Créer la tâche
          </button>
        </form>
      </section>

      <section>
        <h2>Liste des tâches ({tasks.length})</h2>
        {loading && <p style={{ marginTop: '1rem' }}>Chargement des tâches...</p>}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        {!loading && tasks.length === 0 && (
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Aucune tâche enregistrée pour le moment.</p>
        )}

        <div className="tasks-grid" style={{ marginTop: '1rem' }}>
          {tasks.map((task) => (
            <div key={task.id} className="task-item">
              <div>
                <span className={`badge ${getBadgeClass(task.status)}`}>{task.status}</span>
                {editingTaskId === task.id ? (
                  <div style={{ marginBottom: '1rem' }}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{ marginBottom: '0.5rem' }}
                    />
                    <textarea
                      rows="2"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                    <div style={{ marginTop: '0.5rem' }}>
                      <button className="btn-primary" onClick={() => handleSaveEdit(task.id)}>
                        Enregistrer
                      </button>
                      <button className="btn-secondary" onClick={() => setEditingTaskId(null)}>
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="task-title">{task.title}</h3>
                    <p className="task-desc">{task.description || <em>Aucune description</em>}</p>
                  </>
                )}
              </div>

              <div className="task-actions">
                <select
                  className="select-status"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task, e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                <div>
                  {editingTaskId !== task.id && (
                    <button className="btn-secondary" onClick={() => handleStartEdit(task)}>
                      Modifier
                    </button>
                  )}
                  <button className="btn-danger" onClick={() => handleDelete(task.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
