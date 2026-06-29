'use client';

import React from 'react';
import './Services.css';

const SERVICES_DATA = [
  {
    id: 'mesh',
    name: 'Neural Mesh Synthesis',
    desc: 'Generate engine-ready 3D assets and materials dynamically from textual prompts using low-latency latent diffusion models.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    )
  },
  {
    id: 'render',
    name: 'Volumetric Shader Labs',
    desc: 'Real-time WebGPU ray tracing, custom procedural textures, and dynamic atmospheric light scattering computed via Node Material.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        <path d="M2 12h20"/>
      </svg>
    )
  },
  {
    id: 'audio',
    name: 'Spatial Synth Engine',
    desc: 'Procedural generation of fully spatialized environment acoustics and synth audio beds that respond to user mouse interactions.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    )
  },
  {
    id: 'agents',
    name: 'Cognitive Behavior Systems',
    desc: 'Context-aware interactive NPCs and environment controllers utilizing light-weight generative intelligence models.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 16.5V20c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1v-3.5"/>
        <path d="M12 2v4M12 12H4M20 12h-8"/>
        <rect x="8" y="6" width="8" height="6" rx="1"/>
      </svg>
    )
  }
];

export const Services = () => {
  return (
    <div className="services-page">
      <div className="services-container">
        
        {/* Services Header */}
        <header className="services-header">
          <span className="services-tagline">System Core Capabilities</span>
          <h1 className="services-title">Available Operations</h1>
          <p className="services-subtitle">
            Harness the power of WebGPU rendering, neural synthesis, and interactive procedural simulation pipelines.
          </p>
        </header>

        {/* Services Grid */}
        <main className="services-grid">
          {SERVICES_DATA.map((service) => (
            <section key={service.id} className="service-card">
              <div className="service-icon-box">
                {service.icon}
              </div>
              <h2 className="service-name">{service.name}</h2>
              <p className="service-desc">{service.desc}</p>
              <div className="service-link">
                Initiate Module
                <span className="service-link-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </section>
          ))}
        </main>

      </div>
    </div>
  );
};

export default Services;
