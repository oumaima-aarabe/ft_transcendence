import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';

interface NetworkStatusProps {
  isConnected: boolean;
  latency: number;
  packetLoss?: number;
  className?: string;
}

const NetworkStatusIndicator: React.FC<NetworkStatusProps> = ({
  isConnected,
  latency,
  packetLoss = 0,
  className = ''
}) => {
  const [quality, setQuality] = useState<ConnectionQuality>('good');
  const [showDetails, setShowDetails] = useState<boolean>(false);
  
  // Determine connection quality based on latency and packet loss
  useEffect(() => {
    if (!isConnected) {
      setQuality('disconnected');
      return;
    }
    
    if (packetLoss > 10) {
      setQuality('poor');
    } else if (latency < 50 && packetLoss < 2) {
      setQuality('excellent');
    } else if (latency < 100 && packetLoss < 5) {
      setQuality('good');
    } else if (latency < 200 && packetLoss < 10) {
      setQuality('fair');
    } else {
      setQuality('poor');
    }
  }, [isConnected, latency, packetLoss]);
  
  // Visual mapping of quality to colors and icons
  const qualityConfig = {
    excellent: {
      color: 'text-green-500',
      bgColor: 'bg-green-500',
      bars: 4,
      icon: Wifi,
      tooltip: 'Excellent connection'
    },
    good: {
      color: 'text-green-400',
      bgColor: 'bg-green-400',
      bars: 3,
      icon: Wifi,
      tooltip: 'Good connection'
    },
    fair: {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
      bars: 2,
      icon: Wifi,
      tooltip: 'Fair connection'
    },
    poor: {
      color: 'text-orange-500',
      bgColor: 'bg-orange-500',
      bars: 1,
      icon: AlertTriangle,
      tooltip: 'Poor connection'
    },
    disconnected: {
      color: 'text-red-500',
      bgColor: 'bg-red-500',
      bars: 0,
      icon: WifiOff,
      tooltip: 'Disconnected'
    }
  };
  
  const config = qualityConfig[quality];
  const IconComponent = config.icon;
  
  return (
    <div 
      className={`relative flex items-center ${className}`}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Icon indicator */}
      <div className={`${config.color} flex items-center`}>
        <IconComponent size={18} />
      </div>
      
      {/* Signal bars */}
      <div className="flex items-end h-4 ml-1 gap-px">
        {[1, 2, 3, 4].map((barNum) => (
          <div 
            key={barNum}
            className={`w-1 rounded-sm ${barNum <= config.bars ? config.bgColor : 'bg-gray-700'}`}
            style={{ height: `${barNum * 3 + 4}px` }}
          />
        ))}
      </div>
      
      {/* Tooltip with details */}
      {showDetails && (
        <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50">
          <p className="font-medium mb-1">{config.tooltip}</p>
          <div className="grid grid-cols-2 gap-1">
            <span>Latency:</span>
            <span className={latency > 150 ? 'text-orange-400' : 'text-gray-300'}>
              {isConnected ? `${latency}ms` : 'N/A'}
            </span>
            
            <span>Packet Loss:</span>
            <span className={packetLoss > 5 ? 'text-orange-400' : 'text-gray-300'}>
              {isConnected ? `${packetLoss}%` : 'N/A'}
            </span>
            
            <span>Status:</span>
            <span className={config.color}>
              {quality.charAt(0).toUpperCase() + quality.slice(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkStatusIndicator;