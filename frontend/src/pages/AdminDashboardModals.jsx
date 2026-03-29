// This file contains the modal rendering functions for AdminDashboard
// Import this into AdminDashboard.jsx

export const renderModals = (
  showAddModal, setShowAddModal, showEditModal, setShowEditModal,
  activeTab, formErrors, handleAdd, handleUpdate, renderFormFields
) => {
  return (
    <>
      {/* ADD MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New {activeTab.slice(0, -1)}</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleAdd}>
              {formErrors.general && (
                <div className="error-message">{formErrors.general}</div>
              )}
              {renderFormFields(false)}
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add {activeTab.slice(0, -1)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit {activeTab.slice(0, -1)}</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              {formErrors.general && (
                <div className="error-message">{formErrors.general}</div>
              )}
              {renderFormFields(true)}
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update {activeTab.slice(0, -1)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};