// Bootstrap implementation
import { Star, Users, Clock, MapPin } from "lucide-react";
import type { RideCardProps } from "../../../serviceInterface";

export function RideCard({
  driverName,
  rating,
  departureTime,
  availableSeats,
  price,
  destination,
  estimatedDuration,
  carType,
  quadrant,
  driverAddress,
  onSelect
}: RideCardProps) {
  return (
    <div className="card p-4 m-4 shadow-sm border" style={{ borderRadius: '0.75rem' }}>
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div className="d-flex align-items-center" style={{ gap: '0.75rem' }}>
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ 
              width: '3rem', 
              height: '3rem', 
              backgroundColor: '#030213', 
              color: '#ffffff',
              fontSize: '1.25rem',
              fontWeight: '500'
            }}
          >
            {driverName.charAt(0)}
          </div>
          <div>
            <p className="mb-0 fw-medium">{driverName}</p>
            {rating > 0 && !isNaN(rating) ? (
              <div className="d-flex align-items-center" style={{ gap: '0.25rem' }}>
                <Star className="w-4 h-4" style={{ fill: '#facc15', color: '#facc15' }} />
                <span className="text-sm fw-medium">{rating.toFixed(1)}</span>
              </div>
            ) : (
              <div className="d-flex align-items-center" style={{ gap: '0.25rem' }}>
                <Star className="w-4 h-4" style={{ color: '#d1d5db' }} />
                <span className="text-xs text-muted">No rating yet</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-end">
          <p className="mb-0 fw-semibold" style={{ fontSize: '1.125rem' }}>${price}</p>
          <p className="text-sm text-muted mb-0">per person</p>
        </div>
      </div>
      
      <div className="mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="d-flex align-items-center text-sm" style={{ gap: '0.5rem' }}>
          <Clock className="w-4 h-4 text-muted" />
          <span>Departure: {departureTime}</span>
        </div>
        <div className="d-flex align-items-center text-sm" style={{ gap: '0.5rem' }}>
          <Users className="w-4 h-4 text-muted" />
          <span>{availableSeats} seats available</span>
          {carType && (
            <span className="badge bg-secondary text-xs ms-2">{carType}</span>
          )}
        </div>
        {driverAddress ? (
          <div className="d-flex align-items-start text-sm" style={{ gap: '0.5rem' }}>
            <MapPin className="w-4 h-4 text-muted mt-1" style={{ flexShrink: 0 }} />
            <span style={{ wordBreak: 'break-word' }}>{driverAddress}</span>
          </div>
        ) : quadrant ? (
          <div className="d-flex align-items-center text-sm" style={{ gap: '0.5rem' }}>
            <MapPin className="w-4 h-4 text-muted" />
            <span>{quadrant}</span>
          </div>
        ) : null}
        <p className="text-sm text-muted mb-0">
          To: {destination} • {estimatedDuration}
        </p>
      </div>
      
      <button 
        className="btn btn-primary w-100"
        onClick={onSelect}
        style={{ backgroundColor: '#030213', borderColor: '#030213', color: '#ffffff' }}
      >
        Book Ride
      </button>
    </div>
  );
}