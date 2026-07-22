'use client';

import { useState } from 'react';
import { Drone, ShieldCheck } from 'lucide-react';
import type { LanguageCode } from '@/lib/i18n';
import type { WeatherForecast } from '@/types';
import DroneOperationsPanel from './DroneOperationsPanel';
import SprayLockPanel from './SprayLockPanel';

type DeviceId = 'spraylock' | 'drone';

const COPY: Record<LanguageCode, {
  aria: string;
  spraylock: string;
  spraylockHint: string;
  drone: string;
  droneHint: string;
  demo: string;
}> = {
  en: {
    aria: 'Choose smart field device',
    spraylock: 'SprayLock',
    spraylockHint: 'Retrofit safety controller',
    drone: 'Field Drone',
    droneHint: 'Survey and mapping missions',
    demo: 'Demonstration',
  },
  hi: {
    aria: 'स्मार्ट खेत उपकरण चुनें',
    spraylock: 'स्प्रेलॉक',
    spraylockHint: 'सुरक्षा नियंत्रण उपकरण',
    drone: 'खेत ड्रोन',
    droneHint: 'निरीक्षण और नक्शा मिशन',
    demo: 'प्रात्यक्षिक',
  },
  mr: {
    aria: 'स्मार्ट शेत उपकरण निवडा',
    spraylock: 'स्प्रेलॉक',
    spraylockHint: 'सुरक्षा नियंत्रण उपकरण',
    drone: 'शेत ड्रोन',
    droneHint: 'पाहणी आणि नकाशा मोहीम',
    demo: 'प्रात्यक्षिक',
  },
};

type Props = {
  lang: LanguageCode;
  locality: string;
  forecast: WeatherForecast | null;
  farmId: string;
  fieldId: string;
  onViewWeather: () => void;
};

export default function DeviceHub(props: Props) {
  const [activeDevice, setActiveDevice] = useState<DeviceId>('drone');
  const copy = COPY[props.lang];

  return (
    <div className="device-hub">
      <nav className="device-switcher" aria-label={copy.aria}>
        <button
          type="button"
          className={activeDevice === 'spraylock' ? 'is-active' : ''}
          aria-pressed={activeDevice === 'spraylock'}
          onClick={() => setActiveDevice('spraylock')}
        >
          <span className="device-switcher-icon"><ShieldCheck className="h-5 w-5" /></span>
          <span><strong>{copy.spraylock}</strong><small>{copy.spraylockHint}</small></span>
          <em>{copy.demo}</em>
        </button>
        <button
          type="button"
          className={activeDevice === 'drone' ? 'is-active' : ''}
          aria-pressed={activeDevice === 'drone'}
          onClick={() => setActiveDevice('drone')}
        >
          <span className="device-switcher-icon"><Drone className="h-5 w-5" /></span>
          <span><strong>{copy.drone}</strong><small>{copy.droneHint}</small></span>
          <em>{copy.demo}</em>
        </button>
      </nav>

      {activeDevice === 'spraylock' ? <SprayLockPanel {...props} /> : <DroneOperationsPanel {...props} />}
    </div>
  );
}
