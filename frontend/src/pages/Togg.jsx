import React, { useState } from 'react';
import "./Togg.css"
import { 
  Plus, 
  Search, 
  ArrowRight, 
  Navigation, 
  User, 
  Check,
  MapPin
} from 'lucide-react';
const Togg = () => {
    const [activeTab, setActiveTab] = useState('find');
    const [rides] = useState([
      { id: 1, from: "Campus Gate A", to: "Central Station", price: 40, driver: "Alex M.", time: "10:30 AM", vehicle: "White Sedan" },
      { id: 2, from: "Library", to: "Downtown Plaza", price: 25, driver: "Sarah J.", time: "12:15 PM", vehicle: "Black SUV" },
      { id: 3, from: "Hostel Block 3", to: "Sports Complex", price: 15, driver: "Kevin D.", time: "09:00 AM", vehicle: "Bike" }
    ]);
  
    const [published, setPublished] = useState(false);
  
    const handlePublish = (e) => {
      e.preventDefault();
      setPublished(true);
      setTimeout(() => {
        setPublished(false);
        setActiveTab('find');
      }, 2000);
    };
  
    return (
      <div className="app-container">
        <style>{cssStyles}</style>
  
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-top">
            <div className="logo">UNIPOOL</div>
            <nav className="nav-menu">
              <button 
                className={`nav-btn ${activeTab === 'find' ? 'active' : ''}`}
                onClick={() => setActiveTab('find')}
              >
                <Search size={18} /> Find Ride
              </button>
              <button 
                className={`nav-btn ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => setActiveTab('create')}
              >
                <Plus size={18} /> Offer Ride
              </button>
            </nav>
          </div>
          
          <div className="sidebar-footer" style={{ borderTop: '1px solid #ddd', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#fff' }}>
              <User size={20} style={{ margin: 'auto' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: 0 }}>John Doe</p>
              <p style={{ fontSize: '0.75rem', color: '#555', textDecoration: 'underline', cursor: 'pointer', margin: 0 }}>Sign out</p>
            </div>
          </div>
        </aside>
  
        {/* Main Content */}
        <main className="main-content">
          {activeTab === 'find' ? (
            <div className="find-view">
              <header className="content-header">
                <div>
                  <h2 className="page-title">DASHBOARD</h2>
                  <p className="page-subtitle">Available student carpools on campus.</p>
                </div>
                <div className="search-wrapper">
                  <input type="text" className="search-input" placeholder="Search route..." />
                  <Search size={18} style={{ position: 'absolute', right: '12px', top: '12px', color: '#999' }} />
                </div>
              </header>
  
              <div className="rides-list">
                {rides.map(ride => (
                  <div key={ride.id} className="ride-card">
                    <div className="ride-info">
                      <div className="route-display">
                        <span className="location-text">{ride.from}</span>
                        <ArrowRight size={14} color="#999" />
                        <span className="location-text">{ride.to}</span>
                      </div>
                      <div className="ride-meta">
                        <span>{ride.driver}</span>
                        <span>•</span>
                        <span>{ride.vehicle}</span>
                      </div>
                    </div>
  
                    <div className="ride-stats">
                      <div className="stat-block">
                        <div className="stat-label">Departure</div>
                        <div className="stat-value">{ride.time}</div>
                      </div>
                      <div className="stat-block">
                        <div className="stat-label">Price</div>
                        <div className="stat-value price">₹{ride.price}</div>
                      </div>
                      <button className="nav-btn active" style={{ padding: '0.5rem 1.5rem' }}>Book</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="create-view">
              <h2 className="page-title">OFFER RIDE</h2>
              <p className="page-subtitle" style={{ marginBottom: '3rem' }}>Help other students by sharing your empty seats.</p>
  
              <form className="form-container" onSubmit={handlePublish}>
                <div className="input-group">
                  <label className="input-label">Start Point</label>
                  <input type="text" className="form-input" placeholder="e.g. Campus Library" required />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Destination</label>
                  <input type="text" className="form-input" placeholder="e.g. City Center" required />
                </div>
  
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Price</label>
                    <input type="number" className="form-input" placeholder="₹ Amount" required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Time</label>
                    <input type="time" className="form-input" required />
                  </div>
                </div>
  
                <div className="input-group">
                  <label className="input-label">Vehicle Details</label>
                  <input type="text" className="form-input" placeholder="e.g. Red Scooty" required />
                </div>
  
                <button type="submit" className="btn-submit">
                  {published ? <Check size={20} /> : null}
                  {published ? 'PUBLISHED' : 'PUBLISH RIDE'}
                </button>
              </form>
            </div>
          )}
        </main>
  
        {published && (
          <div className="success-toast">
            <Check size={18} /> Ride is now live!
          </div>
        )}
      </div>
    );
  };
  
  export default Togg;