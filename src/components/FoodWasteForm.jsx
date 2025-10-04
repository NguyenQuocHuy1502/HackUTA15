import React, { useState } from 'react';

const FoodWasteForm = () => {
  const [formData, setFormData] = useState({
    kindOfFood: '',
    totalAmount: '',
    amountLeft: '',
    food1: '',
    food2: '',
    food3: '',
    allergens: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Food Waste Data:', formData);
    // Here you would typically send the data to your backend
    alert('Food waste data submitted successfully!');
  };

  return (
    <div className="food-waste-form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>Food Waste Tracking</h2>
          <p>Help reduce food waste by tracking your daily food usage</p>
        </div>
        
        <form onSubmit={handleSubmit} className="food-waste-form">
          <div className="form-group">
            <label htmlFor="kindOfFood">Kind of Food</label>
            <select
              id="kindOfFood"
              name="kindOfFood"
              value={formData.kindOfFood}
              onChange={handleInputChange}
              required
            >
              <option value="">Select food type</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="meat">Meat</option>
              <option value="dairy">Dairy Products</option>
              <option value="grains">Grains & Cereals</option>
              <option value="prepared-meals">Prepared Meals</option>
              <option value="beverages">Beverages</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="totalAmount">Total Amount of Food in a Day (kg)</label>
            <input
              type="number"
              id="totalAmount"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleInputChange}
              placeholder="Enter amount in kilograms"
              min="0"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amountLeft">Amount of Food Left (kg)</label>
            <input
              type="number"
              id="amountLeft"
              name="amountLeft"
              value={formData.amountLeft}
              onChange={handleInputChange}
              placeholder="Enter leftover amount in kilograms"
              min="0"
              step="0.1"
              required
            />
          </div>

          <div className="food-items-section">
            <h3>Individual Food Items</h3>
            
            <div className="form-group">
              <label htmlFor="food1">Food 1 - Amount (kg)</label>
              <input
                type="number"
                id="food1"
                name="food1"
                value={formData.food1}
                onChange={handleInputChange}
                placeholder="Enter amount for food item 1"
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="food2">Food 2 - Amount (kg)</label>
              <input
                type="number"
                id="food2"
                name="food2"
                value={formData.food2}
                onChange={handleInputChange}
                placeholder="Enter amount for food item 2"
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="food3">Food 3 - Amount (kg)</label>
              <input
                type="number"
                id="food3"
                name="food3"
                value={formData.food3}
                onChange={handleInputChange}
                placeholder="Enter amount for food item 3"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="allergens">Ingredients that may cause allergic reactions</label>
            <textarea
              id="allergens"
              name="allergens"
              value={formData.allergens}
              onChange={handleInputChange}
              placeholder="List any ingredients that may cause allergic reactions (e.g., nuts, dairy, gluten, shellfish)"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Submit Food Waste Data
            </button>
            <button type="button" className="reset-button" onClick={() => setFormData({
              kindOfFood: '',
              totalAmount: '',
              amountLeft: '',
              food1: '',
              food2: '',
              food3: '',
              allergens: ''
            })}>
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodWasteForm;
