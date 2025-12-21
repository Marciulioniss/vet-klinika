import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import userService from "../services/userService";
import petsService from "../services/petsService";
import { notificationService } from "../services/notificationService";
import "../styles/Account.css";

const Account = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 0; // Administrator role
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userData, setUserData] = useState({
    // Asmeninė informacija
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",

    // Sistemos nustatymai
    notifications: true,
    language: "lt",
    theme: "light",
  });

  const [pets, setPets] = useState([]);
  const [showPetForm, setShowPetForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [expandedPetDetails, setExpandedPetDetails] = useState({});
  const [showIllnessForm, setShowIllnessForm] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [selectedPetForRecord, setSelectedPetForRecord] = useState(null);
  const [editingIllness, setEditingIllness] = useState(null);
  const [editingVisit, setEditingVisit] = useState(null);
  const [newIllness, setNewIllness] = useState({
    name: "",
    description: "",
    dateDiagnosed: "",
  });
  const [newVisit, setNewVisit] = useState({
    type: 0,
    start: "",
    end: "",
    location: "",
    price: "",
  });
  const [newPet, setNewPet] = useState({
    name: "",
    breed: "",
    species: "",
    speciesLatin: "",
    class: 0, // AnimalClass enum: Mammal=0, Bird=1, Reptile=2, Amphibian=3, Fish=4
    photoUrl: "",
    dateOfBirth: "",
    weight: "",
  });

  // Duomenų įkėlimas iš API
  useEffect(() => {
    loadUserData();
  }, []);

  // Inicijuoti userData su prisijungusio vartotojo duomenimis
  useEffect(() => {
    if (user) {
      setUserData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        birthDate: user.birthDate || "",
      }));
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Naudoti pagerintą userService su automatiniais pranešimais
      const [profileResult, petsResult] = await Promise.all([
        userService.getProfile(false), // Nereikia sėkmės pranešimo įkėlimui
        petsService.getPets(false),
      ]);

      if (profileResult.success) {
        setUserData(profileResult.data || getMockUserData());
      } else {
        // Fallback į mock duomenis jei API nepasiekiamas
        setUserData(getMockUserData());
      }

      if (petsResult.success) {
        setPets(petsResult.data || getMockPets());
      } else {
        setPets(getMockPets());
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      notificationService.addError("Nepavyko įkelti vartotojo duomenų");

      // Fallback į mock duomenis
      setUserData(getMockUserData());
      setPets(getMockPets());
    } finally {
      setLoading(false);
    }
  };

  // Mock duomenys kaip atsarginė kopija
  const getMockUserData = () => ({
    firstName: user?.firstName || "Vardas",
    lastName: user?.lastName || "Pavardė",
    personalCode: user?.personalCode || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    birthDate: user?.birthDate || "",
    notifications: true,
    language: "lt",
    theme: "light",
  });

  const getMockPets = () => [
    {
      id: 1,
      name: "Reksas",
      breed: "Labradoro retriveris",
      species: "Šuo",
      speciesLatin: "Canis lupus familiaris",
      class: 0,
      photoUrl: "",
      dateOfBirth: "2020-05-15",
      weight: 32,
      illnesses: [
        {
          id: 1,
          name: "Ausų infekcija",
          description: "Vidurinio ausies uždegimas",
          dateDiagnosed: "2023-08-15",
        },
      ],
      visits: [
        {
          id: 1,
          type: 0,
          start: "2024-01-10T10:00:00",
          end: "2024-01-10T10:30:00",
          location: "Veterinarijos klinika",
          price: 25.0,
        },
      ],
    },
    {
      id: 2,
      name: "Mūza",
      breed: "Europiečių trumpaplaukis",
      species: "Katė",
      speciesLatin: "Felis catus",
      class: 0,
      photoUrl: "",
      dateOfBirth: "2019-03-20",
      weight: 4.5,
      illnesses: [],
      visits: [],
    },
  ];

  const handleSave = async () => {
    try {
      setLoading(true);

      // Naudoti pagerintą userService su automatiniais pranešimais
      const result = await userService.updateProfile(userData);

      if (result.success) {
        setIsEditing(false);
        // Pranešimas jau bus parodytas automatiškai per userService
      }
    } catch (error) {
      console.error("Klaida saugant duomenis:", error);
      // Klaidos pranešimas jau bus parodytas automatiškai
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePassword = async () => {
    const currentPassword = prompt("Įveskite dabartinį slaptažodį:");
    if (!currentPassword) return;

    const newPassword = prompt("Įveskite naują slaptažodį:");
    if (!newPassword) return;

    const confirmPassword = prompt("Pakartokite naują slaptažodį:");
    if (newPassword !== confirmPassword) {
      notificationService.addError("Slaptažodžiai nesutampa");
      return;
    }

    const result = await userService.changePassword({
      currentPassword,
      newPassword,
    });

    // Pranešimas bus parodytas automatiškai per userService
  };

  const handleDeleteAccount = async () => {
    const result = await userService.deleteAccount();

    if (result.success) {
      // Nukreipti į prisijungimo puslapį
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const handleExportData = async () => {
    await userService.exportUserData();
    // Pranešimas bus parodytas automatiškai per userService
  };

  // Gyvūnų valdymo funkcijos
  const handlePetInputChange = (field, value) => {
    setNewPet((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddPet = () => {
    setEditingPet(null);
    setNewPet({
      name: "",
      breed: "",
      species: "",
      speciesLatin: "",
      class: 0,
      photoUrl: "",
      dateOfBirth: "",
      weight: "",
    });
    setShowPetForm(true);
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet.id);
    setNewPet({
      name: pet.name,
      breed: pet.breed,
      species: pet.species,
      speciesLatin: pet.speciesLatin,
      class: pet.class,
      photoUrl: pet.photoUrl || "",
      dateOfBirth: pet.dateOfBirth,
      weight: pet.weight,
    });
    setShowPetForm(true);
  };

  const handleSavePet = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (editingPet) {
        // Atnaujinti esamą gyvūną
        const result = await petsService.updatePet(editingPet, newPet);
        if (result.success) {
          setPets(
            pets.map((p) =>
              p.id === editingPet ? { ...newPet, id: editingPet } : p
            )
          );
          setShowPetForm(false);
          setEditingPet(null);
        }
      } else {
        // Pridėti naują gyvūną
        const result = await petsService.addPet(newPet);
        if (result.success) {
          const newPetData = result.data || { ...newPet, id: pets.length + 1 };
          setPets([...pets, newPetData]);
          setShowPetForm(false);
        }
      }

      setNewPet({
        name: "",
        breed: "",
        species: "",
        speciesLatin: "",
        class: 0,
        photoUrl: "",
        dateOfBirth: "",
        weight: "",
      });
    } catch (error) {
      console.error("Klaida saugant gyvūną:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async (petId) => {
    if (!confirm("Ar tikrai norite pašalinti šį gyvūną iš sąrašo?")) {
      return;
    }

    try {
      setLoading(true);
      const result = await petsService.deletePet(petId);

      if (result.success) {
        setPets(pets.filter((p) => p.id !== petId));
      }
    } catch (error) {
      console.error("Klaida trinant gyvūną:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "Nežinomas";
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    if (age === 0) {
      const months = monthDiff < 0 ? 12 + monthDiff : monthDiff;
      return `${months} mėn.`;
    }

    return `${age} m.`;
  };

  const togglePetDetails = (petId) => {
    setExpandedPetDetails((prev) => ({
      ...prev,
      [petId]: !prev[petId],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("lt-LT");
  };

  const getVisitTypeName = (type) => {
    const types = [
      "Profilaktinis",
      "Gydymo",
      "Chirurginis",
      "Diagnostinis",
      "Reabilitacinis",
    ];
    return types[type] || "Nežinomas";
  };

  const handleAddIllness = (petId) => {
    setSelectedPetForRecord(petId);
    setEditingIllness(null);
    setNewIllness({
      name: "",
      description: "",
      dateDiagnosed: new Date().toISOString().split("T")[0],
    });
    setShowIllnessForm(true);
  };

  const handleAddVisit = (petId) => {
    setSelectedPetForRecord(petId);
    setEditingVisit(null);
    setNewVisit({
      type: 0,
      start: "",
      end: "",
      location: "",
      price: "",
    });
    setShowVisitForm(true);
  };

  const handleSaveIllness = (e) => {
    e.preventDefault();
    setPets(
      pets.map((pet) => {
        if (pet.id === selectedPetForRecord) {
          const illnesses = pet.illnesses || [];
          if (editingIllness) {
            // Update existing illness
            return {
              ...pet,
              illnesses: illnesses.map((ill) =>
                ill.id === editingIllness.id ? { ...ill, ...newIllness } : ill
              ),
            };
          } else {
            // Add new illness
            return {
              ...pet,
              illnesses: [...illnesses, { id: Date.now(), ...newIllness }],
            };
          }
        }
        return pet;
      })
    );
    setShowIllnessForm(false);
    setEditingIllness(null);
    notificationService.addSuccess(
      editingIllness ? "Liga atnaujinta" : "Liga sėkmingai pridėta"
    );
  };

  const handleSaveVisit = (e) => {
    e.preventDefault();
    setPets(
      pets.map((pet) => {
        if (pet.id === selectedPetForRecord) {
          const visits = pet.visits || [];
          if (editingVisit) {
            // Update existing visit
            return {
              ...pet,
              visits: visits.map((vis) =>
                vis.id === editingVisit.id
                  ? { ...vis, ...newVisit, price: parseFloat(newVisit.price) }
                  : vis
              ),
            };
          } else {
            // Add new visit
            return {
              ...pet,
              visits: [
                ...visits,
                {
                  id: Date.now(),
                  ...newVisit,
                  price: parseFloat(newVisit.price),
                },
              ],
            };
          }
        }
        return pet;
      })
    );
    setShowVisitForm(false);
    setEditingVisit(null);
    notificationService.addSuccess(
      editingVisit ? "Vizitas atnaujintas" : "Vizitas sėkmingai pridėtas"
    );
  };

  const handleEditIllness = (petId, illness) => {
    setSelectedPetForRecord(petId);
    setEditingIllness(illness);
    setNewIllness({
      name: illness.name,
      description: illness.description,
      dateDiagnosed: illness.dateDiagnosed,
    });
    setShowIllnessForm(true);
  };

  const handleDeleteIllness = (petId, illnessId) => {
    if (!confirm("Ar tikrai norite pašalinti šį ligos įrašą?")) {
      return;
    }
    setPets(
      pets.map((pet) => {
        if (pet.id === petId) {
          return {
            ...pet,
            illnesses: (pet.illnesses || []).filter(
              (ill) => ill.id !== illnessId
            ),
          };
        }
        return pet;
      })
    );
    notificationService.addSuccess("Liga pašalinta");
  };

  const handleEditVisit = (petId, visit) => {
    setSelectedPetForRecord(petId);
    setEditingVisit(visit);
    // Format datetime for input
    const formatDateTime = (dateStr) => {
      const date = new Date(dateStr);
      return date.toISOString().slice(0, 16);
    };
    setNewVisit({
      type: visit.type,
      start: formatDateTime(visit.start),
      end: formatDateTime(visit.end),
      location: visit.location,
      price: visit.price.toString(),
    });
    setShowVisitForm(true);
  };

  const handleDeleteVisit = (petId, visitId) => {
    if (!confirm("Ar tikrai norite pašalinti šį vizito įrašą?")) {
      return;
    }
    setPets(
      pets.map((pet) => {
        if (pet.id === petId) {
          return {
            ...pet,
            visits: (pet.visits || []).filter((vis) => vis.id !== visitId),
          };
        }
        return pet;
      })
    );
    notificationService.addSuccess("Vizitas pašalintas");
  };

  const renderProfileTab = () => (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-avatar">
          <span>
            {userData.firstName.charAt(0)}
            {userData.lastName.charAt(0)}
          </span>
        </div>
        <div className="profile-info">
          <h3>
            {userData.firstName} {userData.lastName}
          </h3>
          <p>{userData.email}</p>
        </div>
        <button
          className={`edit-btn ${isEditing ? "save" : "edit"}`}
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={loading}
        >
          {loading ? "Kraunama..." : isEditing ? "Išsaugoti" : "Redaguoti"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="profile-form">
        <div className="form-section">
          <h4>Asmeninė informacija</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Vardas</label>
              <input
                type="text"
                value={userData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                disabled={!isEditing || loading}
              />
            </div>
            <div className="form-group">
              <label>Pavardė</label>
              <input
                type="text"
                value={userData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                disabled={!isEditing || loading}
              />
            </div>
            <div className="form-group">
              <label>Gimimo data</label>
              <input
                type="date"
                value={userData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                disabled={!isEditing || loading}
              />
            </div>
            <div className="form-group">
              <label>El. paštas</label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing || loading}
              />
            </div>
            <div className="form-group">
              <label>Telefono numeris</label>
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing || loading}
              />
            </div>
            <div className="form-group full-width">
              <label>Adresas</label>
              <input
                type="text"
                value={userData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing || loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPetsTab = () => (
    <div className="pets-section">
      <div className="pets-header">
        <h3>Mano gyvūnai</h3>
        <button
          className="btn primary"
          onClick={handleAddPet}
          disabled={loading}
        >
          + Pridėti gyvūną
        </button>
      </div>

      {pets.length === 0 ? (
        <div className="empty-state">
          <p>Dar neturite užregistruotų gyvūnų</p>
          <p>Pridėkite savo augintinį, kad galėtumėte registruoti vizitus</p>
        </div>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => (
            <div key={pet.id} className="pet-card">
              <div className="pet-card-header">
                <div className="pet-avatar">
                  {pet.species === "Šuo"
                    ? "🐕"
                    : pet.species === "Katė"
                    ? "🐈"
                    : "🐾"}
                </div>
                <div className="pet-info">
                  <h4>{pet.name}</h4>
                  <p>
                    {pet.species} • {pet.breed}
                  </p>
                </div>
              </div>

              <div className="pet-details">
                <div className="detail-row">
                  <span className="label">Amžius:</span>
                  <span>{calculateAge(pet.dateOfBirth)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Klasė:</span>
                  <span>
                    {
                      [
                        "Žinduoliai",
                        "Paukščiai",
                        "Ropliai",
                        "Varliagyviai",
                        "Žuvys",
                      ][pet.class]
                    }
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Veislė:</span>
                  <span>{pet.breed}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Svoris:</span>
                  <span>{pet.weight} kg</span>
                </div>
                {pet.speciesLatin && (
                  <div className="detail-row">
                    <span className="label">Lotyn. pavadinimas:</span>
                    <span className="species-latin">{pet.speciesLatin}</span>
                  </div>
                )}
              </div>

              <div className="pet-actions">
                <button
                  className="btn secondary small"
                  onClick={() => togglePetDetails(pet.id)}
                >
                  {expandedPetDetails[pet.id]
                    ? "Slėpti detalės"
                    : "Rodyti detalės"}
                </button>
                <button
                  className="btn secondary small"
                  onClick={() => handleEditPet(pet)}
                  disabled={loading}
                >
                  Redaguoti
                </button>
                <button
                  className="btn danger small"
                  onClick={() => handleDeletePet(pet.id)}
                  disabled={loading}
                >
                  Pašalinti
                </button>
              </div>

              {/* Išplėsta informacija - ligų istorija ir vizitai */}
              {expandedPetDetails[pet.id] && (
                <div className="pet-expanded-details">
                  <div className="pet-section">
                    <div className="section-header">
                      <h5>🩺 Ligų istorija</h5>
                      <button
                        className="btn primary small"
                        onClick={() => handleAddIllness(pet.id)}
                      >
                        + Pridėti ligą
                      </button>
                    </div>
                    {pet.illnesses && pet.illnesses.length > 0 ? (
                      <div className="illnesses-list">
                        {pet.illnesses.map((illness) => (
                          <div key={illness.id} className="illness-item">
                            <div className="illness-header">
                              <strong>{illness.name}</strong>
                              <span className="illness-date">
                                {formatDate(illness.dateDiagnosed)}
                              </span>
                            </div>
                            <p className="illness-description">
                              {illness.description}
                            </p>
                            <div className="record-actions">
                              <button
                                className="btn-icon edit"
                                onClick={() =>
                                  handleEditIllness(pet.id, illness)
                                }
                                title="Redaguoti"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-icon delete"
                                onClick={() =>
                                  handleDeleteIllness(pet.id, illness.id)
                                }
                                title="Šalinti"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-message">Nėra įrašų apie ligas</p>
                    )}
                  </div>

                  <div className="pet-section">
                    <div className="section-header">
                      <h5>💉 Vizitai ir skiepai</h5>
                      <button
                        className="btn primary small"
                        onClick={() => handleAddVisit(pet.id)}
                      >
                        + Pridėti vizitą
                      </button>
                    </div>
                    {pet.visits && pet.visits.length > 0 ? (
                      <div className="visits-list">
                        {pet.visits.map((visit) => (
                          <div key={visit.id} className="visit-item">
                            <div className="visit-header">
                              <strong>{getVisitTypeName(visit.type)}</strong>
                              <span className="visit-date">
                                {formatDate(visit.start)}
                              </span>
                            </div>
                            <div className="visit-details">
                              <p>📍 {visit.location}</p>
                              <p>💰 {visit.price.toFixed(2)} €</p>
                            </div>
                            <div className="record-actions">
                              <button
                                className="btn-icon edit"
                                onClick={() => handleEditVisit(pet.id, visit)}
                                title="Redaguoti"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-icon delete"
                                onClick={() =>
                                  handleDeleteVisit(pet.id, visit.id)
                                }
                                title="Šalinti"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-message">Nėra įrašytų vizitų</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Gyvūno pridėjimo/redagavimo forma */}
      {showPetForm && (
        <div className="modal-overlay" onClick={() => setShowPetForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editingPet ? "Redaguoti gyvūną" : "Pridėti naują gyvūną"}
              </h3>
              <button
                className="close-btn"
                onClick={() => setShowPetForm(false)}
              >
                ×
              </button>
            </div>

            <form className="pet-form" onSubmit={handleSavePet}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Vardas*</label>
                  <input
                    type="text"
                    required
                    value={newPet.name}
                    onChange={(e) =>
                      handlePetInputChange("name", e.target.value)
                    }
                    placeholder="Pvz.: Reksas"
                  />
                </div>

                <div className="form-group">
                  <label>Rūšis (lietuviškai)*</label>
                  <input
                    type="text"
                    required
                    value={newPet.species}
                    onChange={(e) =>
                      handlePetInputChange("species", e.target.value)
                    }
                    placeholder="Pvz.: Šuo, Katė"
                  />
                </div>

                <div className="form-group">
                  <label>Rūšis (lotyniškai)*</label>
                  <input
                    type="text"
                    required
                    value={newPet.speciesLatin}
                    onChange={(e) =>
                      handlePetInputChange("speciesLatin", e.target.value)
                    }
                    placeholder="Pvz.: Canis lupus familiaris"
                  />
                </div>

                <div className="form-group">
                  <label>Veislė*</label>
                  <input
                    type="text"
                    required
                    value={newPet.breed}
                    onChange={(e) =>
                      handlePetInputChange("breed", e.target.value)
                    }
                    placeholder="Pvz.: Labradoro retriveris"
                  />
                </div>

                <div className="form-group">
                  <label>Klasė*</label>
                  <select
                    required
                    value={newPet.class}
                    onChange={(e) =>
                      handlePetInputChange("class", parseInt(e.target.value))
                    }
                  >
                    <option value="">Pasirinkite klasę</option>
                    <option value="0">Žinduoliai (Mammal)</option>
                    <option value="1">Paukščiai (Bird)</option>
                    <option value="2">Ropliai (Reptile)</option>
                    <option value="3">Varliagyviai (Amphibian)</option>
                    <option value="4">Žuvys (Fish)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Gimimo data*</label>
                  <input
                    type="date"
                    required
                    value={newPet.dateOfBirth}
                    onChange={(e) =>
                      handlePetInputChange("dateOfBirth", e.target.value)
                    }
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Svoris (kg)*</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newPet.weight}
                    onChange={(e) =>
                      handlePetInputChange("weight", e.target.value)
                    }
                    placeholder="Pvz.: 25.5"
                  />
                </div>

                <div className="form-group">
                  <label>Nuotraukos URL</label>
                  <input
                    type="text"
                    value={newPet.photoUrl}
                    onChange={(e) =>
                      handlePetInputChange("photoUrl", e.target.value)
                    }
                    placeholder="Pvz.: https://example.com/photo.jpg"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowPetForm(false)}
                  disabled={loading}
                >
                  Atšaukti
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={loading}
                >
                  {loading
                    ? "Saugoma..."
                    : editingPet
                    ? "Išsaugoti"
                    : "Pridėti"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ligos pridėjimo forma */}
      {showIllnessForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowIllnessForm(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingIllness ? "Redaguoti ligą" : "Pridėti ligą"}</h3>
              <button
                className="close-btn"
                onClick={() => setShowIllnessForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveIllness}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Ligos pavadinimas*</label>
                  <input
                    type="text"
                    required
                    value={newIllness.name}
                    onChange={(e) =>
                      setNewIllness({ ...newIllness, name: e.target.value })
                    }
                    placeholder="Pvz.: Ausų infekcija"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Aprašymas*</label>
                  <textarea
                    required
                    value={newIllness.description}
                    onChange={(e) =>
                      setNewIllness({
                        ...newIllness,
                        description: e.target.value,
                      })
                    }
                    rows="4"
                    placeholder="Ligos aprašymas ir simptomai"
                  />
                </div>

                <div className="form-group">
                  <label>Diagnozės data*</label>
                  <input
                    type="date"
                    required
                    value={newIllness.dateDiagnosed}
                    onChange={(e) =>
                      setNewIllness({
                        ...newIllness,
                        dateDiagnosed: e.target.value,
                      })
                    }
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowIllnessForm(false)}
                >
                  Atšaukti
                </button>
                <button type="submit" className="btn primary">
                  {editingIllness ? "Išsaugoti" : "Pridėti ligą"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vizito pridėjimo forma */}
      {showVisitForm && (
        <div className="modal-overlay" onClick={() => setShowVisitForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editingVisit ? "Redaguoti vizitą" : "Pridėti vizitą/skiepą"}
              </h3>
              <button
                className="close-btn"
                onClick={() => setShowVisitForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveVisit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Vizito tipas*</label>
                  <select
                    required
                    value={newVisit.type}
                    onChange={(e) =>
                      setNewVisit({
                        ...newVisit,
                        type: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value="0">Profilaktinis (Skiepas)</option>
                    <option value="1">Gydymo</option>
                    <option value="2">Chirurginis</option>
                    <option value="3">Diagnostinis</option>
                    <option value="4">Reabilitacinis</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Vieta*</label>
                  <input
                    type="text"
                    required
                    value={newVisit.location}
                    onChange={(e) =>
                      setNewVisit({ ...newVisit, location: e.target.value })
                    }
                    placeholder="Pvz.: Veterinarijos klinika"
                  />
                </div>

                <div className="form-group">
                  <label>Pradžios data ir laikas*</label>
                  <input
                    type="datetime-local"
                    required
                    value={newVisit.start}
                    onChange={(e) =>
                      setNewVisit({ ...newVisit, start: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Pabaigos data ir laikas*</label>
                  <input
                    type="datetime-local"
                    required
                    value={newVisit.end}
                    onChange={(e) =>
                      setNewVisit({ ...newVisit, end: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Kaina (€)*</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newVisit.price}
                    onChange={(e) =>
                      setNewVisit({ ...newVisit, price: e.target.value })
                    }
                    placeholder="Pvz.: 25.00"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowVisitForm(false)}
                >
                  Atšaukti
                </button>
                <button type="submit" className="btn primary">
                  {editingVisit ? "Išsaugoti" : "Pridėti vizitą"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="settings-section">
      <div className="form-section">
        <h4>Sistemos nustatymai</h4>
        <div className="settings-grid">
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={userData.notifications}
                onChange={(e) =>
                  handleInputChange("notifications", e.target.checked)
                }
                disabled={!isEditing || loading}
              />
              Gauti el. pašto pranešimus
            </label>
          </div>
          <div className="setting-item">
            <label>Kalba</label>
            <select
              value={userData.language}
              onChange={(e) => handleInputChange("language", e.target.value)}
              disabled={!isEditing || loading}
            >
              <option value="lt">Lietuvių</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Tema</label>
            <select
              value={userData.theme}
              onChange={(e) => handleInputChange("theme", e.target.value)}
              disabled={!isEditing || loading}
            >
              <option value="light">Šviesi</option>
              <option value="dark">Tamsi</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Saugumo nustatymai</h4>
        <div className="security-actions">
          <button
            className="btn secondary"
            onClick={handleChangePassword}
            disabled={loading}
          >
            Keisti slaptažodį
          </button>
          <button className="btn secondary" disabled={loading}>
            Dviejų veiksnių autentifikacija
          </button>
          <button
            className="btn secondary"
            onClick={handleExportData}
            disabled={loading}
          >
            Eksportuoti duomenis
          </button>
          <button
            className="btn danger"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            Ištrinti paskyrą
          </button>
        </div>
      </div>
    </div>
  );

  if (loading && !userData.firstName) {
    return (
      <div className="account-page">
        <div className="loading-spinner">
          <p>Kraunami duomenys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-header">
        <h2>Paskyros valdymas</h2>
        <p>Tvarkykite savo asmeninę informaciją ir sistemos nustatymus</p>
      </div>

      <div className="account-tabs">
        <button
          className={`tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
          disabled={loading}
        >
          Profilis
        </button>
        {!isAdmin && (
          <button
            className={`tab ${activeTab === "pets" ? "active" : ""}`}
            onClick={() => setActiveTab("pets")}
            disabled={loading}
          >
            Gyvūnai
          </button>
        )}
        <button
          className={`tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
          disabled={loading}
        >
          Nustatymai
        </button>
      </div>

      <div className="account-content">
        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "pets" && !isAdmin && renderPetsTab()}
        {activeTab === "settings" && renderSettingsTab()}
      </div>
    </div>
  );
};

export default Account;
