import React from 'react';

export default function AddProductModal({ show, onClose, product, onChange, onSubmit }) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Product</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <select
                value={product.name}
                onChange={(e) => onChange('name', e.target.value)}
                required
              >
                <option value="">Select medicine...</option>
                
                {/* Antibiotics */}
                <optgroup label="Antibiotics">
                  <option value="Amoxicillin 250mg">Amoxicillin 250mg</option>
                  <option value="Amoxicillin 500mg">Amoxicillin 500mg</option>
                  <option value="Azithromycin 250mg">Azithromycin 250mg</option>
                  <option value="Azithromycin 500mg">Azithromycin 500mg</option>
                  <option value="Ciprofloxacin 250mg">Ciprofloxacin 250mg</option>
                  <option value="Ciprofloxacin 500mg">Ciprofloxacin 500mg</option>
                  <option value="Cephalexin 250mg">Cephalexin 250mg</option>
                  <option value="Cephalexin 500mg">Cephalexin 500mg</option>
                  <option value="Doxycycline 100mg">Doxycycline 100mg</option>
                  <option value="Metronidazole 400mg">Metronidazole 400mg</option>
                  <option value="Clindamycin 150mg">Clindamycin 150mg</option>
                  <option value="Erythromycin 250mg">Erythromycin 250mg</option>
                  <option value="Levofloxacin 500mg">Levofloxacin 500mg</option>
                  <option value="Cefixime 200mg">Cefixime 200mg</option>
                  <option value="Norfloxacin 400mg">Norfloxacin 400mg</option>
                </optgroup>

                {/* Painkillers */}
                <optgroup label="Painkillers & Anti-inflammatory">
                  <option value="Paracetamol 500mg">Paracetamol 500mg</option>
                  <option value="Paracetamol 650mg">Paracetamol 650mg</option>
                  <option value="Ibuprofen 200mg">Ibuprofen 200mg</option>
                  <option value="Ibuprofen 400mg">Ibuprofen 400mg</option>
                  <option value="Aspirin 75mg">Aspirin 75mg</option>
                  <option value="Aspirin 150mg">Aspirin 150mg</option>
                  <option value="Diclofenac 50mg">Diclofenac 50mg</option>
                  <option value="Diclofenac Gel 30g">Diclofenac Gel 30g</option>
                  <option value="Naproxen 250mg">Naproxen 250mg</option>
                  <option value="Tramadol 50mg">Tramadol 50mg</option>
                  <option value="Ketorolac 10mg">Ketorolac 10mg</option>
                  <option value="Mefenamic Acid 250mg">Mefenamic Acid 250mg</option>
                </optgroup>

                {/* Diabetes */}
                <optgroup label="Diabetes">
                  <option value="Metformin 500mg">Metformin 500mg</option>
                  <option value="Metformin 850mg">Metformin 850mg</option>
                  <option value="Glimepiride 1mg">Glimepiride 1mg</option>
                  <option value="Glimepiride 2mg">Glimepiride 2mg</option>
                  <option value="Glibenclamide 5mg">Glibenclamide 5mg</option>
                  <option value="Sitagliptin 50mg">Sitagliptin 50mg</option>
                  <option value="Insulin Glargine 100IU/ml">Insulin Glargine 100IU/ml</option>
                  <option value="Insulin Regular 100IU/ml">Insulin Regular 100IU/ml</option>
                </optgroup>

                {/* Heart & Blood Pressure */}
                <optgroup label="Heart & Blood Pressure">
                  <option value="Atorvastatin 10mg">Atorvastatin 10mg</option>
                  <option value="Atorvastatin 20mg">Atorvastatin 20mg</option>
                  <option value="Amlodipine 5mg">Amlodipine 5mg</option>
                  <option value="Amlodipine 10mg">Amlodipine 10mg</option>
                  <option value="Losartan 50mg">Losartan 50mg</option>
                  <option value="Enalapril 5mg">Enalapril 5mg</option>
                  <option value="Bisoprolol 5mg">Bisoprolol 5mg</option>
                  <option value="Carvedilol 6.25mg">Carvedilol 6.25mg</option>
                  <option value="Clopidogrel 75mg">Clopidogrel 75mg</option>
                  <option value="Digoxin 0.25mg">Digoxin 0.25mg</option>
                  <option value="Furosemide 40mg">Furosemide 40mg</option>
                </optgroup>

                {/* Digestive */}
                <optgroup label="Digestive & Gastric">
                  <option value="Omeprazole 20mg">Omeprazole 20mg</option>
                  <option value="Omeprazole 40mg">Omeprazole 40mg</option>
                  <option value="Pantoprazole 40mg">Pantoprazole 40mg</option>
                  <option value="Ranitidine 150mg">Ranitidine 150mg</option>
                  <option value="Esomeprazole 40mg">Esomeprazole 40mg</option>
                  <option value="Domperidone 10mg">Domperidone 10mg</option>
                  <option value="Ondansetron 4mg">Ondansetron 4mg</option>
                  <option value="Loperamide 2mg">Loperamide 2mg</option>
                  <option value="Antacid Syrup 200ml">Antacid Syrup 200ml</option>
                </optgroup>

                {/* Respiratory */}
                <optgroup label="Respiratory & Allergy">
                  <option value="Cetirizine 10mg">Cetirizine 10mg</option>
                  <option value="Loratadine 10mg">Loratadine 10mg</option>
                  <option value="Montelukast 10mg">Montelukast 10mg</option>
                  <option value="Salbutamol Inhaler 100mcg">Salbutamol Inhaler 100mcg</option>
                  <option value="Budesonide Inhaler 200mcg">Budesonide Inhaler 200mcg</option>
                  <option value="Cough Syrup 100ml">Cough Syrup 100ml</option>
                  <option value="Ambroxol 30mg">Ambroxol 30mg</option>
                  <option value="Chlorpheniramine 4mg">Chlorpheniramine 4mg</option>
                  <option value="Pseudoephedrine 60mg">Pseudoephedrine 60mg</option>
                </optgroup>

                {/* Vitamins & Supplements */}
                <optgroup label="Vitamins & Supplements">
                  <option value="Vitamin C 500mg">Vitamin C 500mg</option>
                  <option value="Vitamin C 1000mg">Vitamin C 1000mg</option>
                  <option value="Vitamin D3 1000 IU">Vitamin D3 1000 IU</option>
                  <option value="Vitamin D3 60000 IU">Vitamin D3 60000 IU</option>
                  <option value="Vitamin B Complex">Vitamin B Complex</option>
                  <option value="Vitamin E 400 IU">Vitamin E 400 IU</option>
                  <option value="Calcium 500mg">Calcium 500mg</option>
                  <option value="Iron 65mg">Iron 65mg</option>
                  <option value="Zinc 50mg">Zinc 50mg</option>
                  <option value="Multivitamin Tablets">Multivitamin Tablets</option>
                  <option value="Omega-3 Fish Oil 1000mg">Omega-3 Fish Oil 1000mg</option>
                  <option value="Folic Acid 5mg">Folic Acid 5mg</option>
                </optgroup>

                {/* Antacids & Digestive Enzymes */}
                <optgroup label="Antacids & Enzymes">
                  <option value="Digene Gel 200ml">Digene Gel 200ml</option>
                  <option value="Eno Powder 5g">Eno Powder 5g</option>
                  <option value="Gelusil Syrup 200ml">Gelusil Syrup 200ml</option>
                  <option value="Pancreatin Tablets">Pancreatin Tablets</option>
                </optgroup>

                {/* Antiseptics & Topical */}
                <optgroup label="Antiseptics & Topical">
                  <option value="Betadine Solution 100ml">Betadine Solution 100ml</option>
                  <option value="Hydrogen Peroxide 100ml">Hydrogen Peroxide 100ml</option>
                  <option value="Dettol Liquid 500ml">Dettol Liquid 500ml</option>
                  <option value="Neosporin Ointment 5g">Neosporin Ointment 5g</option>
                  <option value="Clotrimazole Cream 15g">Clotrimazole Cream 15g</option>
                  <option value="Hydrocortisone Cream 15g">Hydrocortisone Cream 15g</option>
                  <option value="Mupirocin Ointment 5g">Mupirocin Ointment 5g</option>
                </optgroup>

                {/* Cold & Flu */}
                <optgroup label="Cold & Flu">
                  <option value="Paracetamol + Caffeine">Paracetamol + Caffeine</option>
                  <option value="Cold Relief Tablets">Cold Relief Tablets</option>
                  <option value="Sinarest Tablets">Sinarest Tablets</option>
                  <option value="Vicks Vaporub 50ml">Vicks Vaporub 50ml</option>
                </optgroup>

                {/* Antidepressants & Mental Health */}
                <optgroup label="Mental Health">
                  <option value="Fluoxetine 20mg">Fluoxetine 20mg</option>
                  <option value="Sertraline 50mg">Sertraline 50mg</option>
                  <option value="Escitalopram 10mg">Escitalopram 10mg</option>
                  <option value="Alprazolam 0.5mg">Alprazolam 0.5mg</option>
                  <option value="Clonazepam 0.5mg">Clonazepam 0.5mg</option>
                  <option value="Diazepam 5mg">Diazepam 5mg</option>
                </optgroup>

                {/* Thyroid */}
                <optgroup label="Thyroid">
                  <option value="Levothyroxine 50mcg">Levothyroxine 50mcg</option>
                  <option value="Levothyroxine 100mcg">Levothyroxine 100mcg</option>
                  <option value="Carbimazole 5mg">Carbimazole 5mg</option>
                </optgroup>

                {/* Eye & Ear Drops */}
                <optgroup label="Eye & Ear Care">
                  <option value="Moxifloxacin Eye Drops 5ml">Moxifloxacin Eye Drops 5ml</option>
                  <option value="Timolol Eye Drops 5ml">Timolol Eye Drops 5ml</option>
                  <option value="Artificial Tears 10ml">Artificial Tears 10ml</option>
                  <option value="Ciprofloxacin Ear Drops 10ml">Ciprofloxacin Ear Drops 10ml</option>
                </optgroup>

                {/* Contraceptives */}
                <optgroup label="Contraceptives">
                  <option value="Oral Contraceptive Pills">Oral Contraceptive Pills</option>
                  <option value="Emergency Contraceptive">Emergency Contraceptive</option>
                </optgroup>

                {/* Skin Care */}
                <optgroup label="Skin Care">
                  <option value="Tretinoin Cream 0.025%">Tretinoin Cream 0.025%</option>
                  <option value="Benzoyl Peroxide Gel 2.5%">Benzoyl Peroxide Gel 2.5%</option>
                  <option value="Calamine Lotion 100ml">Calamine Lotion 100ml</option>
                  <option value="Moisturizing Cream 50g">Moisturizing Cream 50g</option>
                </optgroup>

                {/* Others */}
                <optgroup label="Other Medicines">
                  <option value="Antihistamine Tablets">Antihistamine Tablets</option>
                  <option value="Antifungal Cream 15g">Antifungal Cream 15g</option>
                  <option value="Oral Rehydration Salts">Oral Rehydration Salts</option>
                  <option value="Activated Charcoal 250mg">Activated Charcoal 250mg</option>
                  <option value="Glycerin Suppository">Glycerin Suppository</option>
                </optgroup>
              </select>
            </div>

            <div className="form-group">
              <label>Generic Name</label>
              <input
                type="text"
                value={product.genericName}
                onChange={(e) => onChange('genericName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={product.category}
                onChange={(e) => onChange('category', e.target.value)}
                required
              >
                <option value="Antibiotic">Antibiotic</option>
                <option value="Painkiller">Painkiller</option>
                <option value="Vitamin">Vitamin</option>
                <option value="Supplement">Supplement</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Manufacturer</label>
              <input
                type="text"
                value={product.manufacturer}
                onChange={(e) => onChange('manufacturer', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Batch Number</label>
              <input
                type="text"
                value={product.batchNumber}
                onChange={(e) => onChange('batchNumber', e.target.value)}
                placeholder="Auto-generated if empty"
              />
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                value={product.quantity}
                onChange={(e) => onChange('quantity', parseInt(e.target.value))}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Price (Rs) *</label>
              <input
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => onChange('price', parseFloat(e.target.value))}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Manufacture Date *</label>
              <input
                type="date"
                value={product.manufactureDate}
                onChange={(e) => onChange('manufactureDate', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Expiry Date *</label>
              <input
                type="date"
                value={product.expiryDate}
                onChange={(e) => onChange('expiryDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
