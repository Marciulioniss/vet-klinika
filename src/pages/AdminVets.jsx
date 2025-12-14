import { useEffect, useState } from 'react'
import veterinariansService from '../services/veterinariansService'

const AdminVets = () => {
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', specialty: '', licenseNumber: ''
  })

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      setLoading(true)
      const res = await veterinariansService.getAll()
      setVets(res.success ? (res.data || []) : mockVets())
    } catch {
      setVets(mockVets())
    } finally {
      setLoading(false)
    }
  }

  const mockVets = () => [
    { id: 1, firstName: 'Petras', lastName: 'Petraitis', email: 'vet1@email.com', phone: '+37060000001', specialty: 'Chirurgas', licenseNumber: 'LIC-001' },
    { id: 2, firstName: 'Ana', lastName: 'Kazlienė', email: 'vet2@email.com', phone: '+37060000002', specialty: 'Kardiologas', licenseNumber: 'LIC-002' }
  ]

  const startCreate = () => { setEditingId(null); setForm({ firstName: '', lastName: '', email: '', phone: '', specialty: '', licenseNumber: '' }); setShowForm(true) }
  const startEdit = (v) => { setEditingId(v.id); setForm({ ...v }); setShowForm(true) }

  const save = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const res = await veterinariansService.update(editingId, form)
        if (res.success) {
          setVets(vets.map(v => v.id === editingId ? { ...form, id: editingId } : v))
        }
      } else {
        const res = await veterinariansService.create(form)
        const created = res.success ? (res.data || { ...form, id: (vets[vets.length-1]?.id || 0) + 1 }) : { ...form, id: (vets[vets.length-1]?.id || 0) + 1 }
        setVets([...vets, created])
      }
      setShowForm(false)
      setEditingId(null)
      setForm({ firstName: '', lastName: '', email: '', phone: '', specialty: '', licenseNumber: '' })
    } catch {}
  }

  const removeVet = async (id) => {
    if (!window.confirm('Pašalinti veterinarą?')) return
    try {
      const res = await veterinariansService.remove(id)
      if (res.success || true) setVets(vets.filter(v => v.id !== id))
    } catch {}
  }

  if (loading) return <div>Kraunama...</div>

  return (
    <div>
      <div className="pets-header">
        <h3>Veterinarai</h3>
        <button className="btn primary" onClick={startCreate}>+ Pridėti</button>
      </div>

      {vets.length === 0 ? (
        <div className="empty-state"><p>Veterinarų nėra</p></div>
      ) : (
        <div className="pets-grid">
          {vets.map(v => (
            <div key={v.id} className="pet-card">
              <div className="pet-card-header">
                <div className="pet-avatar">🩺</div>
                <div className="pet-info">
                  <h4>{v.firstName} {v.lastName}</h4>
                  <p>{v.specialty} • {v.licenseNumber}</p>
                </div>
              </div>
              <div className="pet-details">
                <div className="detail-row"><span className="label">El. paštas:</span><span>{v.email}</span></div>
                <div className="detail-row"><span className="label">Telefonas:</span><span>{v.phone}</span></div>
              </div>
              <div className="pet-actions">
                <button className="btn secondary small" onClick={() => startEdit(v)}>Redaguoti</button>
                <button className="btn danger small" onClick={() => removeVet(v.id)}>Šalinti</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Redaguoti veterinarą' : 'Pridėti veterinarą'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form className="pet-form" onSubmit={save}>
              <div className="form-grid">
                <div className="form-group"><label>Vardas*</label><input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                <div className="form-group"><label>Pavardė*</label><input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
                <div className="form-group"><label>El. paštas*</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="form-group"><label>Telefonas*</label><input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="form-group"><label>Specializacija*</label><input required value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} /></div>
                <div className="form-group"><label>Licencijos nr.*</label><input required value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} /></div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn secondary" onClick={() => setShowForm(false)}>Atšaukti</button>
                <button type="submit" className="btn primary">Išsaugoti</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminVets
