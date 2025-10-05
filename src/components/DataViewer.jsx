import React, { useState, useEffect } from 'react'

const DataViewer = () => {
  const [localData, setLocalData] = useState({})
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    loadLocalData()
  }, [])

  const loadLocalData = () => {
    const data = {}
    
    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('daily_imports_') || key.startsWith('food_leftovers_'))) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key))
        } catch (error) {
          console.error('Error parsing localStorage data:', error)
        }
      }
    }
    
    setLocalData(data)
  }

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all local data?')) {
      Object.keys(localData).forEach(key => {
        localStorage.removeItem(key)
      })
      loadLocalData()
    }
  }

  const exportData = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      data: localData
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `feco-data-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const dataKeys = Object.keys(localData)
  const dates = [...new Set(dataKeys.map(key => key.split('_').slice(2).join('_')))]
  
  const filteredData = selectedDate 
    ? Object.fromEntries(Object.entries(localData).filter(([key]) => key.includes(selectedDate)))
    : localData

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Local Data Viewer</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        This shows data saved locally when Supabase is unavailable.
      </p>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>
          Filter by Date:
          <select 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="">All Dates</option>
            {dates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </label>
        
        <button 
          onClick={loadLocalData}
          style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Refresh
        </button>
        
        <button 
          onClick={exportData}
          style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Export All Data
        </button>
        
        <button 
          onClick={clearAllData}
          style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Clear All
        </button>
      </div>

      {Object.keys(filteredData).length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No local data found.</p>
      ) : (
        <div>
          {Object.entries(filteredData).map(([key, entries]) => (
            <div key={key} style={{ marginBottom: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                {key.replace('_', ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h3>
              
              {Array.isArray(entries) ? (
                entries.map((entry, index) => (
                  <div key={index} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                      Saved: {new Date(entry.saved_at).toLocaleString()} | 
                      Source: {entry.source} | 
                      Date: {entry.date}
                    </div>
                    
                    {entry.importData && (
                      <div>
                        <strong>Daily Import Data:</strong>
                        <pre style={{ fontSize: '12px', backgroundColor: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                          {JSON.stringify(entry.importData, null, 2)}
                        </pre>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#28a745' }}>
                          Total: {entry.totalImports?.toFixed(2)} lbs
                        </div>
                      </div>
                    )}
                    
                    {entry.leftoverData && (
                      <div>
                        <strong>Food Leftover Data:</strong>
                        <pre style={{ fontSize: '12px', backgroundColor: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                          {JSON.stringify(entry.leftoverData, null, 2)}
                        </pre>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffc107' }}>
                          Total: {entry.totalLeftovers?.toFixed(2)} lbs
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <pre style={{ fontSize: '12px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                  {JSON.stringify(entries, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DataViewer
