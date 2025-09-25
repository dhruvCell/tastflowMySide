import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaClock, FaUserFriends, FaFire, FaStar, FaUtensils, FaLeaf, FaHeart } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './FoodDetail.css';
import Footer from '../Footer/Footer';
import Teams from '../Teams/Teams';

const FoodDetail = () => {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        window.scrollTo(0, 0);
        const response = await fetch(`http://localhost:5000/api/food/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setFood(data.data);
          setCheckedIngredients(new Array(data.data.ingredients?.length || 0).fill(false));
        } else {
          setError(data.message || 'Failed to fetch food details.');
          toast.error(data.message || 'Failed to fetch food details.');
        }
      } catch (error) {
        setError(error.message);
        toast.error('An error occurred while fetching food details.');
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [id]);

  const handleIngredientCheck = (index) => {
    const updatedChecked = [...checkedIngredients];
    updatedChecked[index] = !updatedChecked[index];
    setCheckedIngredients(updatedChecked);
  };

  const calculateNutritionPercentages = () => {
    if (!food?.nutritionalInfo) return { carbs: 0, protein: 0, fat: 0 };
    
    const carbs = parseInt(food.nutritionalInfo.carbohydrates) || 0;
    const protein = parseInt(food.nutritionalInfo.protein) || 0;
    const fat = parseInt(food.nutritionalInfo.fat) || 0;
    
    const total = carbs + protein + fat;
    
    if (total === 0) return { carbs: 0, protein: 0, fat: 0 };
    
    return {
      carbs: Math.round((carbs / total) * 100),
      protein: Math.round((protein / total) * 100),
      fat: Math.round((fat / total) * 100)
    };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-container">
          <div className="spinner-gradient">
            <FaUtensils className="spinner-icon" />
          </div>
          <p>Loading delicious details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <div className="error-icon">🍳</div>
          <h2>Recipe Not Available</h2>
          <p>We're having trouble loading this recipe. Please try again.</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Reload Recipe
          </button>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="error-container">
        <div className="error-message">
          <div className="error-icon">🔍</div>
          <h2>Recipe Not Found</h2>
          <p>This recipe seems to have wandered off. Try another one!</p>
          <button onClick={() => window.history.back()} className="retry-btn">
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  const nutritionPercentages = calculateNutritionPercentages();

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Hero Section - Full Width */}
      <div className="food-hero">
        <img
          className="hero-bg-image"
          src={`http://localhost:5000/uploads/${food.image}`}
          alt={food.name}
          onError={(e) => {
            e.target.src = '/placeholder-food.jpg'; // Fallback image
          }}
        />
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="food-badge">
              <FaLeaf className="badge-icon" />
              {food.category}
            </div>
            <h1 className="food-title">{food.name}</h1>
            <p className="food-tagline">
              {food.tagline || `A delicious ${food.category?.toLowerCase()} that will delight your taste buds`}
            </p>
            <div className="food-meta">
              <div className="meta-item">
                <FaClock className="meta-icon" />
                <span>{food.preparationTime || '30 mins'}</span>
              </div>
              <div className="meta-item">
                <FaUserFriends className="meta-icon" />
                <span>{food.servings || '4'} servings</span>
              </div>
              <div className="meta-item">
                <FaFire className="meta-icon" />
                <span>{food.calories || '320'} cal</span>
              </div>
              <div className="meta-item rating">
                <FaStar className="meta-icon" />
                <span>{food.rating || '4.8'}</span>
              </div>
              {food.difficulty && (
                <div
                  className="meta-item difficulty"
                  style={{color: getDifficultyColor(food.difficulty)}}
                >
                  <span>•</span>
                  {food.difficulty}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="food-detail-container">
        {/* Main Content */}
        <div className="food-content">
          <div className="content-wrapper">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
                onClick={() => setActiveTab('ingredients')}
              >
                <FaUtensils className="tab-icon" />
                Ingredients
              </button>
              <button 
                className={`tab-btn ${activeTab === 'preparation' ? 'active' : ''}`}
                onClick={() => setActiveTab('preparation')}
              >
                <FaClock className="tab-icon" />
                Preparation
              </button>
              <button 
                className={`tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`}
                onClick={() => setActiveTab('nutrition')}
              >
                <FaHeart className="tab-icon" />
                Nutrition
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'ingredients' && (
                <div className="tab-panel active">
                  <div className="section-header">
                    <h2 className="section-title">Ingredients</h2>
                    <div className="ingredients-count">
                      {checkedIngredients.filter(Boolean).length} of {food.ingredients?.length} completed
                    </div>
                  </div>
                  <div className="ingredients-section">
                    <div className="ingredients-list">
                      {food.ingredients?.map((ingredient, index) => (
                        <div key={index} className="ingredient-item">
                          <div className="ingredient-checkbox">
                            <input 
                              type="checkbox" 
                              id={`ingredient-${index}`}
                              checked={checkedIngredients[index]}
                              onChange={() => handleIngredientCheck(index)}
                            />
                            <label htmlFor={`ingredient-${index}`}>
                              <FaCheckCircle className="check-icon" />
                            </label>
                          </div>
                          <span className={`ingredient-text ${checkedIngredients[index] ? 'checked' : ''}`}>
                            {ingredient}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="ingredients-visual">
                      <img 
                        src={`http://localhost:5000/uploads/${food.image}`} 
                        alt="Ingredients" 
                        className={`ingredients-img ${imageLoaded ? 'loaded' : ''}`}
                        onLoad={() => setImageLoaded(true)}
                      />
                      <div className="visual-overlay"></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preparation' && (
                <div className="tab-panel active">
                  <div className="section-header">
                    <h2 className="section-title">Preparation Steps</h2>
                    <div className="steps-count">{food.preparationSteps?.length} steps</div>
                  </div>
                  <div className="steps-section">
                    {food.preparationSteps?.map((step, index) => (
                      <div key={index} className="step-card">
                        <div className="step-header">
                          <div className="step-number">{index + 1}</div>
                          <h3 className="step-title">Step {index + 1}</h3>
                        </div>
                        <p className="step-description">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div className="tab-panel active">
                  <h2 className="section-title">Nutritional Information</h2>
                  <div className="nutrition-section">
                    <div className="nutrition-chart">
                      <div className="chart-container">
                        <div className="chart-bar">
                          <div className="chart-info">
                            <span className="chart-label">Carbs</span>
                            <span className="chart-value">{nutritionPercentages.carbs}%</span>
                          </div>
                          <div className="chart-progress">
                            <div 
                              className="progress-fill carbs" 
                              style={{width: `${nutritionPercentages.carbs}%`}}
                            ></div>
                          </div>
                        </div>
                        <div className="chart-bar">
                          <div className="chart-info">
                            <span className="chart-label">Protein</span>
                            <span className="chart-value">{nutritionPercentages.protein}%</span>
                          </div>
                          <div className="chart-progress">
                            <div 
                              className="progress-fill protein" 
                              style={{width: `${nutritionPercentages.protein}%`}}
                            ></div>
                          </div>
                        </div>
                        <div className="chart-bar">
                          <div className="chart-info">
                            <span className="chart-label">Fat</span>
                            <span className="chart-value">{nutritionPercentages.fat}%</span>
                          </div>
                          <div className="chart-progress">
                            <div 
                              className="progress-fill fat" 
                              style={{width: `${nutritionPercentages.fat}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="nutrition-details">
                      <h3 className="details-title">Detailed Breakdown</h3>
                      {food.nutritionalInfo && Object.entries(food.nutritionalInfo).map(([nutrient, amount], index) => (
                        <div key={index} className="nutrition-item">
                          <span className="nutrient-name">{nutrient}</span>
                          <span className="nutrient-amount">{amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="description-section">
              <h2 className="section-title">About This Dish</h2>
              <p className="food-description">{food.description}</p>
              
              <div className="additional-info">
                {food.origin && (
                  <div className="info-card">
                    <div className="info-icon">🌍</div>
                    <div className="info-content">
                      <strong>Origin</strong>
                      <span>{food.origin}</span>
                    </div>
                  </div>
                )}
                {food.difficulty && (
                  <div className="info-card">
                    <div className="info-icon">⚡</div>
                    <div className="info-content">
                      <strong>Difficulty</strong>
                      <span style={{color: getDifficultyColor(food.difficulty)}}>
                        {food.difficulty}
                      </span>
                    </div>
                  </div>
                )}
                {food.tags && food.tags.length > 0 && (
                  <div className="info-card">
                    <div className="info-icon">🏷️</div>
                    <div className="info-content">
                      <strong>Tags</strong>
                      <div className="tags-container">
                        {food.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Teams />
        <Footer />
      </div>
    </>
  );
};

export default FoodDetail;