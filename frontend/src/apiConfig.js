// Dynamic API Configuration for Local Dev & Production Deployments (Render, Railway, Vercel)
export const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL !== undefined)
  ? import.meta.env.VITE_API_URL
  : (typeof window !== 'undefined' && window.location && window.location.port === '5173' ? 'http://localhost:8000' : '');
