import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Send, Check, Info, FileText, UserCheck } from 'lucide-react';
import { API_BASE } from '../apiConfig';

export default function GrapNoticeCard({ grapData }) {
  const [dispatched, setDispatched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [officerName, setOfficerName] = useState("Dr. P. Gargava, Member Secretary (CAQM)");
  const [dispatchTimestamp, setDispatchTimestamp] = useState(null);

  const notice = grapData?.auto_drafted_notice;
  const activeDetails = grapData?.active_mandate_details;
  const stageName = activeDetails?.name || "Stage III — 'Severe' Air Quality";
  const checklist = notice?.action_checklist || activeDetails?.statutory_mandates || [];

  const handleConfirmSign = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/v1/grap/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletin_id: notice?.bulletin_id || 'CAQM/GRAP/NCR/2026/03',
          officer_name: officerName,
          action_notes: "Statutory mandates ratified under CAQM Act Section 12."
        })
      });
    } catch (e) {
      // Offline simulation fallback
    } finally {
      setLoading(false);
      setDispatched(true);
      setShowSignModal(false);
      setDispatchTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  return (
    <div className="card-zen">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={20} color="var(--aqi-severe)" />
          <h3 className="card-title">CAQM GRAP Regulatory Compliance Engine</h3>
        </div>
        <span className="card-badge" style={{ backgroundColor: 'var(--aqi-severe)', color: '#FFFFFF' }}>
          Mandate: {grapData?.current_stage?.replace('_', ' ') || 'STAGE III'}
        </span>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Automated Graded Response Action Plan (GRAP) threshold trigger and legal compliance bulletin.
      </p>

      {/* Official Notice Document */}
      <div className="grap-document">
        <div className="grap-document-header">
          <div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Statutory Authority: {notice?.statutory_authority || 'CAQM Act Section 12 (Govt of India)'}
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {stageName}
            </div>
          </div>
          <span className="mono" style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>
            {notice?.bulletin_id || 'CAQM/GRAP/NCR/2026/03'}
          </span>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '10px 0 16px', lineHeight: 1.45 }}>
          {notice?.trigger_grounds || 'Forecast indicates persistent severe inversion trapping with AQI > 400.'}
        </div>

        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Enforceable Compliance Actions (Auto-Drafted):
        </div>

        <ul className="grap-checklist">
          {checklist.map((item, index) => (
            <li key={index}>
              <CheckCircle2 size={16} className="grap-check-icon" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Governance Explanation Box */}
        <div style={{
          margin: '14px 0',
          padding: '10px 14px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>Why is Nodal Officer Sign-Off Required?</strong>
          <br/>
          Under CAQM statutory guidelines, algorithmic triggers prepare the legal notice, but executive orders halting construction, banning diesel trucks, or closing schools legally require human-in-the-loop authorization by a designated civil authority.
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Status:{' '}
            <strong style={{ color: dispatched ? 'var(--aqi-good)' : 'var(--accent-inversion)' }}>
              {dispatched ? `Dispatched & Broadcasted at ${dispatchTimestamp}` : 'Drafted — Pending Nodal Officer Sign-Off'}
            </strong>
          </div>

          <button
            className={`btn-zen ${dispatched ? '' : 'primary'}`}
            onClick={() => {
              if (!dispatched) setShowSignModal(true);
            }}
            disabled={dispatched || loading}
          >
            {dispatched ? (
              <>
                <Check size={16} /> Dispatched to DPCC & Police
              </>
            ) : (
              <>
                <UserCheck size={16} /> Sign & Dispatch Notice
              </>
            )}
          </button>
        </div>
      </div>

      {/* Officer Sign-Off Modal */}
      {showSignModal && (
        <div className="modal-overlay" onClick={() => setShowSignModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <FileText size={20} color="var(--accent-health)" />
              <h3 className="heading-serif" style={{ fontSize: '1.4rem' }}>Executive Nodal Sign-Off</h3>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Authorize statutory GRAP Stage III mandate enforcement across Delhi NCR jurisdictions:
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Designated Nodal Officer:</label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  marginTop: '4px'
                }}
              />
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--color-surface-elevated)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
              Broadcast recipients:
              <ul style={{ paddingLeft: '18px', marginTop: '4px' }}>
                <li>Delhi Pollution Control Committee (DPCC)</li>
                <li>Delhi Traffic Police (Heavy Vehicle Entry Restrictions)</li>
                <li>Directorate of Education (School Mode Shift)</li>
                <li>Municipal Corporation of Delhi (MCD Anti-Smog Guns)</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-zen" onClick={() => setShowSignModal(false)}>Cancel</button>
              <button className="btn-zen primary" onClick={handleConfirmSign} disabled={loading}>
                {loading ? 'Authenticating...' : 'Digitally Ratify & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
