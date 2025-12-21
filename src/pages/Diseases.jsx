import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import diseasesService from "../services/diseasesService";
import "../styles/Diseases.css";

const Diseases = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 0;
  const [diseases, setDiseases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDiseases, setUserDiseases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    latinName: "",
    category: 0,
    description: "",
  });

  const categories = [
    { value: "all", label: "Visos kategorijos" },
    { value: 0, label: "Infekcija (Infection)" },
    { value: 1, label: "Ne infekcija (Not_Infection)" },
    { value: 2, label: "Genetinė (Genetic)" },
    { value: 3, label: "Elgesio (Behavioral)" },
    { value: 4, label: "Organų sistemos (Organ_system)" },
  ];

  useEffect(() => {
    loadDiseases();
    loadUserDiseases();
  }, []);

  const loadDiseases = async () => {
    try {
      setLoading(true);
      const data = await diseasesService
        .getDiseases()
        .catch(() => getMockDiseases());
      setDiseases(data);
    } catch (error) {
      console.error("Klaida įkeliant ligų duomenis:", error);
      setDiseases(getMockDiseases());
    } finally {
      setLoading(false);
    }
  };

  const loadUserDiseases = async () => {
    try {
      const data = await diseasesService.getUserDiseases().catch(() => []);
      setUserDiseases(data);
    } catch (error) {
      console.error("Klaida įkeliant vartotojo ligų duomenis:", error);
    }
  };

  const startCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      latinName: "",
      category: 0,
      description: "",
    });
    setShowForm(true);
  };

  const startEdit = (disease) => {
    setEditingId(disease.id);
    setForm({
      name: disease.name,
      latinName: disease.latinName || "",
      category: disease.category || 0,
      description: disease.description,
    });
    setShowForm(true);
    setSelectedDisease(null);
  };

  const saveDisease = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        symptoms: form.symptoms
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editingId) {
        const res = await diseasesService.updateDiseaseRecord(editingId, data);
        if (res.success || true) {
          setDiseases(
            diseases.map((d) =>
              d.id === editingId ? { ...data, id: editingId } : d
            )
          );
        }
      } else {
        const res = await diseasesService.addDiseaseRecord(data);
        const created = res.success
          ? res.data || {
              ...data,
              id: (diseases[diseases.length - 1]?.id || 0) + 1,
            }
          : { ...data, id: (diseases[diseases.length - 1]?.id || 0) + 1 };
        setDiseases([...diseases, created]);
      }
      setShowForm(false);
      setForm({
        name: "",
        latinName: "",
        category: 0,
        description: "",
      });
    } catch (err) {
      console.error("Error saving disease:", err);
    }
  };

  const deleteDisease = async (id) => {
    if (!window.confirm("Pašalinti ligą?")) return;
    try {
      const res = await diseasesService.deleteDiseaseRecord(id);
      if (res.success || true) setDiseases(diseases.filter((d) => d.id !== id));
      setSelectedDisease(null);
    } catch (err) {
      console.error("Error deleting disease:", err);
    }
  };

  const getMockDiseases = () => [
    {
      id: 1,
      name: "Arterinė hipertenzija",
      latinName: "Hypertensio arterialis",
      category: 4, // Organ_system
      description: "Padidėjęs arterinis kraujospūdis",
    },
    {
      id: 2,
      name: "Bronchų astma",
      latinName: "Asthma bronchiale",
      category: 4, // Organ_system
      description: "Lėtinis kvėpavimo takų uždegimas",
    },
    {
      id: 3,
      name: "Diabetas",
      latinName: "Diabetes mellitus",
      category: 4, // Organ_system
      description: "Gliukozės metabolizmo sutrikimas",
    },
    {
      id: 4,
      name: "Gastritas",
      latinName: "Gastritis",
      category: 0, // Infection
      description: "Skrandžio gleivinės uždegimas",
    },
    {
      id: 5,
      name: "Epilepsija",
      latinName: "Epilepsia",
      category: 2, // Genetic
      description: "Lėtinis neurologinis sutrikimas",
    },
  ];

  const filteredDiseases = diseases.filter((disease) => {
    const matchesSearch =
      disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disease.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || disease.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToUserDiseases = async (disease) => {
    try {
      await diseasesService.addDiseaseRecord({
        diseaseId: disease.id,
        diagnosisDate: new Date().toISOString(),
        status: "active",
      });
      setUserDiseases([...userDiseases, disease]);
      alert("Liga pridėta į jūsų sveikatos istoriją");
    } catch (error) {
      console.error("Klaida pridedant ligą:", error);
    }
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.label : "Nežinoma";
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "#28a745";
      case "moderate":
        return "#ffc107";
      case "high":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case "low":
        return "Lengva";
      case "moderate":
        return "Vidutinė";
      case "high":
        return "Sunki";
      default:
        return "Nežinoma";
    }
  };

  if (loading) {
    return (
      <div className="diseases-page">
        <div className="loading-spinner">Kraunami duomenys...</div>
      </div>
    );
  }

  return (
    <div className="diseases-page">
      <div className="diseases-header">
        <h2>Ligų duomenų bazė</h2>
        <p>Ieškokite informacijos apie ligas, jų simptomus ir gydymo metodus</p>
        {isAdmin && (
          <button
            className="btn primary"
            onClick={startCreate}
            style={{ marginTop: "1rem" }}
          >
            + Pridėti ligą
          </button>
        )}
      </div>

      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Ieškoti ligų pagal pavadinimą ar aprašymą..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value === "all" ? "all" : parseInt(e.target.value))
            }
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="diseases-content">
        <div className="diseases-grid">
          {filteredDiseases.map((disease) => (
            <div key={disease.id} className="disease-card">
              <div className="disease-header">
                <h3>{disease.name}</h3>
                {disease.latinName && (
                  <p className="latin-name">{disease.latinName}</p>
                )}
              </div>

              <p className="disease-description">{disease.description}</p>

              <div className="disease-category">
                <span className="category-label">
                  {getCategoryLabel(disease.category)}
                </span>
              </div>

              <div className="disease-actions">
                <button
                  className="btn primary"
                  onClick={() => setSelectedDisease(disease)}
                >
                  Peržiūrėti
                </button>
                {isAdmin ? (
                  <>
                    <button
                      className="btn secondary"
                      onClick={() => startEdit(disease)}
                    >
                      Redaguoti
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => deleteDisease(disease.id)}
                    >
                      Šalinti
                    </button>
                  </>
                ) : (
                  <button
                    className="btn secondary"
                    onClick={() => addToUserDiseases(disease)}
                  >
                    Pridėti į istoriją
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredDiseases.length === 0 && (
          <div className="no-results">
            <p>Pagal jūsų paieškos kriterijus ligų nerasta.</p>
          </div>
        )}
      </div>

      {userDiseases.length > 0 && (
        <div className="user-diseases-section">
          <h3>Jūsų sveikatos istorija</h3>
          <div className="user-diseases-list">
            {userDiseases.map((disease) => (
              <div key={disease.id} className="user-disease-item">
                <span>{disease.name}</span>
                <span className="diagnosis-date">
                  Diagnozė: {new Date().toLocaleDateString("lt-LT")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDisease && (
        <div
          className="disease-modal-overlay"
          onClick={() => setSelectedDisease(null)}
        >
          <div className="disease-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedDisease.name}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedDisease(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="disease-details">
                <div className="detail-section">
                  <h4>Aprašymas</h4>
                  <p>{selectedDisease.description}</p>
                </div>

                <div className="detail-section">
                  <h4>Pagrindiniai simptomai</h4>
                  <ul>
                    {selectedDisease.symptoms?.map((symptom, index) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>Gydymas</h4>
                  <p>{selectedDisease.treatment}</p>
                </div>

                <div className="disease-meta">
                  <div className="meta-item">
                    <span className="meta-label">Sunkumas:</span>
                    <span
                      className="meta-value severity"
                      style={{
                        color: getSeverityColor(selectedDisease.severity),
                      }}
                    >
                      {getSeverityLabel(selectedDisease.severity)}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Kategorija:</span>
                    <span className="meta-value">
                      {
                        categories.find(
                          (c) => c.value === selectedDisease.category
                        )?.label
                      }
                    </span>
                  </div>
                </div>
              </div>
              {isAdmin && (
                <div
                  className="modal-actions"
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "flex-end",
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "2px solid #e9ecef",
                  }}
                >
                  <button
                    className="btn secondary"
                    onClick={() => startEdit(selectedDisease)}
                  >
                    Redaguoti
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => deleteDisease(selectedDisease.id)}
                  >
                    Šalinti
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin forma */}
      {showForm && isAdmin && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? "Redaguoti ligą" : "Pridėti ligą"}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>
            <form className="pet-form" onSubmit={saveDisease}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Liga lotyniškai*</label>
                  <input
                    required
                    value={form.latinName}
                    onChange={(e) =>
                      setForm({ ...form, latinName: e.target.value })
                    }
                    placeholder="Pvz.: Diabetes mellitus"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Ligos pavadinimas*</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Pvz.: Diabetas"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Ligos kategorija*</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: parseInt(e.target.value) })
                    }
                  >
                    {categories
                      .filter((c) => c.value !== "all")
                      .map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Ligos aprašymas*</label>
                  <textarea
                    required
                    rows="4"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Ligos aprašymas, požymiai ir ypatumai"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowForm(false)}
                >
                  Atšaukti
                </button>
                <button type="submit" className="btn primary">
                  Išsaugoti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diseases;
