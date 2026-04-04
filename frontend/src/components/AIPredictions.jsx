import React, { useState, useEffect } from 'react';
import './AIPredictions.css';
import { aiAPI } from '../services/api';

export default function AIPredictions() {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mlBackendStatus, setMlBackendStatus] = useState('checking');

  useEffect(() => {
    checkMLBackend();
  }, []);

  const checkMLBackend = async () => {
    try {
      const isOnline = await aiAPI.checkHealth();
      if (isOnline) {
        setMlBackendStatus('online');
        fetchPredictions();
      } else {
        setMlBackendStatus('offline');
        setLoading(false);
      }
    } catch (err) {
      setMlBackendStatus('offline');
      setLoading(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const data = await aiAPI.getAllPredictions();
      
      if (data.success) {
        setPredictions(data);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch predictions');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const trainModel = async () => {
    try {
      setLoading(true);
      const data = await aiAPI.trainModels();
      
      if (data.success) {
        const expiryModel = data.expiry_model || {};
        alert(`✅ Model trained successfully!\n\nTraining samples: ${data.training_samples || 0}\nTest R²: ${((expiryModel.test_r2 || 0) * 100).toFixed(1)}%\nTest MSE: ${(expiryModel.test_mse || 0).toFixed(2)}`);
        fetchPredictions();
      } else {
        alert(`❌ Training failed: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f59e0b';
      case 'Medium': return '#eab308';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (mlBackendStatus === 'offline') {
    return (
      <div className="ai-predictions-container">
        <div className="ml-backend-offline">
          <div className="offline-icon">🤖</div>
          <h3>ML Backend Offline</h3>
          <p>The AI prediction service is not running.</p>
          <div className="offline-instructions">
            <p><strong>To enable AI predictions:</strong></p>
            <ol>
              <li>Open a new terminal</li>
              <li>Run: <code>cd ai</code></li>
              <li>Run: <code>pip install -r requirements.txt</code> (first time only)</li>
              <li>Run: <code>python app.py</code></li>
              <li>Refresh this page</li>
            </ol>
            <p style={{marginTop: '12px', fontSize: '13px', color: '#64748b'}}>
              💡 Or use <code>START_PROJECT.bat</code> which auto-starts the AI backend
            </p>
          </div>
          <button className="retry-btn" onClick={checkMLBackend}>
            🔄 Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ai-predictions-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading AI predictions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-predictions-container">
        <div className="error-state">
          <h3>⚠️ Error Loading Predictions</h3>
          <p>{error}</p>
          <button className="train-model-btn" onClick={trainModel}>
            🎓 Train ML Model First
          </button>
        </div>
      </div>
    );
  }

  if (!predictions || !predictions.predictions || predictions.predictions.length === 0) {
    return (
      <div className="ai-predictions-container">
        <div className="no-predictions">
          <h3>🎉 No High-Risk Items</h3>
          <p>All products are within safe expiry ranges!</p>
          <button className="refresh-btn" onClick={fetchPredictions}>
            🔄 Refresh Predictions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-predictions-container">
      <div className="ai-header">
        <div className="ai-title">
          <h2>🤖 AI Expiry Risk Analysis</h2>
          <span className="ml-badge">Machine Learning Powered</span>
        </div>
        <div className="ai-actions">
          <button className="train-model-btn" onClick={trainModel}>
            🎓 Retrain Model
          </button>
          <button className="refresh-btn" onClick={fetchPredictions}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="ai-summary">
        <div className="summary-card critical">
          <div className="summary-icon">🚨</div>
          <div className="summary-content">
            <div className="summary-value">{predictions.criticalRisk || 0}</div>
            <div className="summary-label">Critical Risk</div>
          </div>
        </div>
        <div className="summary-card high">
          <div className="summary-icon">⚠️</div>
          <div className="summary-content">
            <div className="summary-value">{predictions.highRisk || 0}</div>
            <div className="summary-label">High Risk</div>
          </div>
        </div>
        <div className="summary-card medium">
          <div className="summary-icon">⚡</div>
          <div className="summary-content">
            <div className="summary-value">{predictions.mediumRisk || 0}</div>
            <div className="summary-label">Medium Risk</div>
          </div>
        </div>
        <div className="summary-card value">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <div className="summary-value">Rs {(predictions.totalValueAtRisk || 0).toLocaleString()}</div>
            <div className="summary-label">Value at Risk</div>
          </div>
        </div>
      </div>

      <div className="predictions-table-container">
        <table className="predictions-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Batch</th>
              <th>Expiry</th>
              <th>Stock</th>
              <th>Risk Score</th>
              <th>Risk Level</th>
              <th>AI Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {predictions.predictions.map((pred, index) => (
              <tr key={index} className={`risk-${pred.urgency}`}>
                <td className="product-name">{pred.productName}</td>
                <td>{pred.batchNumber}</td>
                <td>
                  <div className="expiry-info">
                    <div>{pred.daysUntilExpiry < 0 ? 'EXPIRED' : `${pred.daysUntilExpiry} days left`}</div>
                  </div>
                </td>
                <td>
                  <div className="stock-info">
                    <div>{pred.currentStock || 0} units</div>
                  </div>
                </td>
                <td>
                  <div className="risk-score-container">
                    <div 
                      className="risk-score-bar" 
                      style={{
                        width: `${pred.riskScore}%`,
                        backgroundColor: getRiskColor(pred.riskLevel)
                      }}
                    >
                      {pred.riskScore}
                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    className="risk-badge" 
                    style={{ backgroundColor: getRiskColor(pred.riskLevel) }}
                  >
                    {pred.riskLevel}
                  </span>
                </td>
                <td className="recommendation">{pred.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ai-footer">
        <div className="ml-info">
          <span className="ml-label">Model:</span> {predictions.modelType}
          <span className="ml-separator">•</span>
          <span className="ml-label">Analyzed:</span> {predictions.totalAnalyzed} products
          <span className="ml-separator">•</span>
          <span className="ml-status">✅ ML Active</span>
        </div>
      </div>
    </div>
  );
}
