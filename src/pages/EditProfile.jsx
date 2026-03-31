import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../features/auth/authSlice';

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FORM = {
  firstName:   '',
  lastName:    '',
  email:       '',
  dateOfBirth: '',
  country:     'Morocco',
  city:        '',
  phoneCode:   '+212',
  phone:       '',
};

const COUNTRIES = [
  'Morocco', 'Algeria', 'Tunisia', 'Egypt', 'France', 'United States',
  'United Kingdom', 'Canada', 'Germany', 'Spain', 'Italy', 'Netherlands',
  'Belgium', 'Switzerland', 'Portugal', 'Saudi Arabia', 'UAE', 'Qatar',
];

const PHONE_CODES = [
  { code: '+212', flag: '🇲🇦', label: 'MA' },
  { code: '+213', flag: '🇩🇿', label: 'DZ' },
  { code: '+216', flag: '🇹🇳', label: 'TN' },
  { code: '+20',  flag: '🇪🇬', label: 'EG' },
  { code: '+33',  flag: '🇫🇷', label: 'FR' },
  { code: '+1',   flag: '🇺🇸', label: 'US' },
  { code: '+44',  flag: '🇬🇧', label: 'GB' },
  { code: '+49',  flag: '🇩🇪', label: 'DE' },
  { code: '+34',  flag: '🇪🇸', label: 'ES' },
  { code: '+39',  flag: '🇮🇹', label: 'IT' },
  { code: '+966', flag: '🇸🇦', label: 'SA' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
];

const validate = (form) => {
  const errors = {};
  if (!form.firstName.trim())   errors.firstName   = 'First name is required.';
  if (!form.lastName.trim())    errors.lastName    = 'Last name is required.';
  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.dateOfBirth)        errors.dateOfBirth = 'Date is required.';
  if (!form.city.trim())        errors.city        = 'Enter a city.';
  if (!form.phone.trim())       errors.phone       = 'This field is required.';
  return errors;
};

// ─── Animated Background ──────────────────────────────────────────────────────

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let rafId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const ORBS = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: 180 + Math.random() * 160, dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
      hue: [260, 280, 300, 220, 245, 270][i], alpha: 0.07 + Math.random() * 0.06,
    }));
    const SPARKS = Array.from({ length: 45 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: 0.8 + Math.random() * 1.8, speed: 0.15 + Math.random() * 0.45,
      maxA: 0.25 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2,
    }));
    let t = 0;
    const draw = () => {
      t += 0.008;
      const { width: W, height: H } = canvas;
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#f0ecff'); bg.addColorStop(0.4, '#e8e0fa');
      bg.addColorStop(0.75, '#f3eaf8'); bg.addColorStop(1, '#eaf0ff');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      for (const orb of ORBS) {
        orb.x += orb.dx; orb.y += orb.dy;
        if (orb.x < -orb.r) orb.x = W + orb.r; if (orb.x > W + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = H + orb.r; if (orb.y > H + orb.r) orb.y = -orb.r;
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        g.addColorStop(0, `hsla(${orb.hue},65%,72%,${orb.alpha})`);
        g.addColorStop(1, `hsla(${orb.hue},65%,72%,0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2); ctx.fill();
      }
      for (const s of SPARKS) {
        s.y -= s.speed;
        if (s.y < -10) { s.y = H + 10; s.x = Math.random() * W; }
        const alpha = s.maxA * 0.3 * (0.5 + 0.5 * Math.sin(t * 2.5 + s.phase));
        ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#8b6ef0';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} aria-hidden="true" style={{ position:'fixed', inset:0, width:'100vw', height:'100vh', zIndex:0, display:'block', pointerEvents:'none' }} />;
};

// ─── Field component ──────────────────────────────────────────────────────────

const Field = ({ label, required, error, children }) => (
  <div className="EP-field">
    {label && (
      <label className="EP-label">
        {label}{required && <span className="EP-required"> *</span>}
      </label>
    )}
    {children}
    {error && <span className="EP-error"><span className="EP-error-dot">!</span>{error}</span>}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const EditProfile = () => {
  const { user }  = useSelector((state) => state.auth);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState(INITIAL_FORM);
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [saving,  setSaving]  = useState(false);
  const [photo,   setPhoto]   = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (user) {
      const [city = '', state = ''] = (user.location || '').split(',').map(s => s.trim());
      setForm(prev => ({
        ...prev,
        firstName:   user.firstName   || '',
        lastName:    user.lastName    || '',
        email:       user.email       || '',
        phone:       user.phone       || '',
        city,
        country:     user.country     || 'Morocco',
        dateOfBirth: user.dateOfBirth || '',
        phoneCode:   user.phoneCode   || '+212',
      }));
    }
  }, [user]);

  const set = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => { const { [name]: _, ...rest } = prev; return rest; });
  }, []);

  const handleChange = useCallback((e) => set(e.target.name, e.target.value), [set]);
  const handleBlur   = useCallback((e) => setTouched(prev => ({ ...prev, [e.target.name]: true })), []);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched(Object.fromEntries(Object.keys(form).map(k => [k, true])));
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, location: `${form.city}, ${form.country}` };
      await dispatch(updateUser(payload));
      navigate(`/profile/${user._id}`);
    } catch (err) {
      console.error('[EditProfile]', err);
    } finally {
      setSaving(false);
    }
  };

  const err = (name) => touched[name] ? errors[name] : undefined;
  const initials = `${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}`.toUpperCase() || '?';

  return (
    <>
      <style>{STYLES}</style>
      <AnimatedBackground />

      <main className="EP-root">
        <div className="EP-card">

          {/* ── Progress ── */}
          <div className="EP-progress-wrap">
            <span className="EP-progress-label">Profile completion</span>
            <div className="EP-progress-bar"><div className="EP-progress-fill" /></div>
          </div>

          {/* ── Heading ── */}
          <h1 className="EP-heading">A few last details, then you can check and publish your profile.</h1>
          <p className="EP-subheading">
            A professional photo helps you build trust. Update your personal and address information below.
          </p>

          <div className="EP-divider" />

          <form onSubmit={handleSubmit} noValidate className="EP-form">

            {/* ── Two-column: photo + fields ── */}
            <div className="EP-top-row">

              {/* Photo upload */}
              <div className="EP-photo-col">
                <div className="EP-avatar-wrap">
                  {photoPreview
                    ? <img src={photoPreview} alt="Profile" className="EP-avatar-img" />
                    : <div className="EP-avatar-initials">{initials}</div>
                  }
                  <button type="button" className="EP-avatar-add" onClick={() => fileRef.current?.click()} aria-label="Add photo">+</button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
                <button type="button" className="EP-upload-btn" onClick={() => fileRef.current?.click()}>
                  + Upload photo
                </button>
                {!photoPreview && <p className="EP-photo-hint"><span className="EP-error-dot">!</span> Add a profile photo.</p>}
              </div>

              {/* Right fields */}
              <div className="EP-fields-col">

                {/* Name row */}
                <div className="EP-row-2">
                  <Field label="First Name" required error={err('firstName')}>
                    <input name="firstName" value={form.firstName} onChange={handleChange} onBlur={handleBlur}
                      placeholder="John" className={`EP-input${err('firstName') ? ' EP-input--err' : ''}`} />
                  </Field>
                  <Field label="Last Name" required error={err('lastName')}>
                    <input name="lastName" value={form.lastName} onChange={handleChange} onBlur={handleBlur}
                      placeholder="Doe" className={`EP-input${err('lastName') ? ' EP-input--err' : ''}`} />
                  </Field>
                </div>

                {/* Email */}
                <Field label="Email Address" required error={err('email')}>
                  <input name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur}
                    placeholder="john.doe@example.com" className={`EP-input${err('email') ? ' EP-input--err' : ''}`} />
                </Field>

                {/* Date of birth */}
                <Field label="Date of Birth" required error={err('dateOfBirth')}>
                  <div className="EP-input-icon-wrap">
                    <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} onBlur={handleBlur}
                      className={`EP-input${err('dateOfBirth') ? ' EP-input--err' : ''}`} />
                    <span className="EP-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </span>
                  </div>
                </Field>

                {/* Country */}
                <Field label="Country" required>
                  <div className="EP-select-wrap">
                    <select name="country" value={form.country} onChange={handleChange} className="EP-select">
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <span className="EP-select-arrow">▾</span>
                  </div>
                </Field>

              </div>
            </div>

            <div className="EP-divider" />

            {/* ── Address ── */}
            <div className="EP-section-label">Address</div>

            

            <div className="EP-row-3">
              <Field label="City" required error={err('city')}>
                <input name="city" value={form.city} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Enter city" className={`EP-input${err('city') ? ' EP-input--err' : ''}`} />
              </Field>
             
            </div>

            <div className="EP-divider" />

            {/* ── Phone ── */}
            <div className="EP-section-label">Phone</div>

            <Field label="Phone" required error={err('phone')}>
              <div className="EP-phone-wrap">
                <div className="EP-phone-code-wrap">
                  <select
                    name="phoneCode"
                    value={form.phoneCode}
                    onChange={handleChange}
                    className="EP-phone-code"
                  >
                    {PHONE_CODES.map(p => (
                      <option key={p.code} value={p.code}>{p.flag} {p.code}</option>
                    ))}
                  </select>
                  <span className="EP-select-arrow">▾</span>
                </div>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter number"
                  className={`EP-input EP-phone-input${err('phone') ? ' EP-input--err' : ''}`}
                />
              </div>
            </Field>

            <div className="EP-divider" />

            {/* ── Actions ── */}
            <div className="EP-actions">
              <button type="button" className="EP-btn EP-btn--back" onClick={() => navigate(-1)} disabled={saving}>
                Back
              </button>
              <button type="submit" className="EP-btn EP-btn--submit" disabled={saving} aria-busy={saving}>
                {saving ? 'Saving…' : 'Review your profile'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Serif+Display&display=swap');

  .EP-root {
    position:        relative;
    z-index:         1;
    min-height:      100vh;
    display:         flex;
    align-items:     flex-start;
    justify-content: center;
    padding:         2.5rem 1rem 4rem;
    font-family:     'DM Sans', sans-serif;
  }

  .EP-card {
    position:      relative;
    z-index:       2;
    width:         100%;
    max-width:     760px;
    background:    #ffffff;
    border-radius: 20px;
    padding:       2.5rem 2.25rem;
    border:        1px solid rgba(180,160,255,0.18);
    box-shadow:    0 4px 32px rgba(124,92,245,0.09), 0 1px 4px rgba(0,0,0,0.04);
    animation:     EP-rise 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes EP-rise {
    from { opacity:0; transform: translateY(20px) scale(0.98); }
    to   { opacity:1; transform: translateY(0)    scale(1);    }
  }

  /* Progress */
  .EP-progress-wrap {
    display:       flex;
    align-items:   center;
    gap:           0.75rem;
    margin-bottom: 1.5rem;
  }

  .EP-progress-label {
    font-size:   0.72rem;
    font-weight: 600;
    color:       #b8aedd;
    letter-spacing: .07em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .EP-progress-bar {
    flex:          1;
    height:        3px;
    background:    #ede8ff;
    border-radius: 99px;
    overflow:      hidden;
  }

  .EP-progress-fill {
    height:        100%;
    width:         90%;
    background:    linear-gradient(90deg, #7c5cf5, #ae6ed4);
    border-radius: 99px;
  }

  /* Heading */
  .EP-heading {
    font-family: 'DM Serif Display', serif;
    font-size:   1.55rem;
    font-weight: 400;
    color:       #1a1530;
    margin:      0 0 0.5rem;
    line-height: 1.35;
  }

  .EP-subheading {
    font-size:   0.855rem;
    color:       #9e96b8;
    margin:      0;
    line-height: 1.6;
  }

  .EP-divider {
    border:     none;
    border-top: 1px solid #f0ecff;
    margin:     1.75rem 0;
  }

  .EP-form { display: flex; flex-direction: column; gap: 0; }

  /* Top row: photo + fields */
  .EP-top-row {
    display:   flex;
    gap:       2.5rem;
    align-items: flex-start;
  }

  /* Photo column */
  .EP-photo-col {
    display:        flex;
    flex-direction: column;
    align-items:    center;
    gap:            0.75rem;
    flex-shrink:    0;
    width:          120px;
  }

  .EP-avatar-wrap {
    position:      relative;
    width:         88px;
    height:        88px;
  }

  .EP-avatar-img,
  .EP-avatar-initials {
    width:         88px;
    height:        88px;
    border-radius: 50%;
    object-fit:    cover;
  }

  .EP-avatar-initials {
    display:         flex;
    align-items:     center;
    justify-content: center;
    font-family:     'DM Serif Display', serif;
    font-size:       1.5rem;
    color:           #fff;
    background:      linear-gradient(135deg, #9b7ef8, #cc7fd4);
    box-shadow:      0 0 0 3px rgba(155,126,248,0.2);
  }

  .EP-avatar-add {
    position:      absolute;
    bottom:        2px;
    right:         2px;
    width:         24px;
    height:        24px;
    border-radius: 50%;
    background:    linear-gradient(135deg, #7c5cf5, #ae6ed4);
    color:         #fff;
    font-size:     1rem;
    line-height:   1;
    border:        2px solid #fff;
    cursor:        pointer;
    display:       flex;
    align-items:   center;
    justify-content: center;
    padding:       0;
    transition:    transform .15s;
  }
  .EP-avatar-add:hover { transform: scale(1.12); }

  .EP-upload-btn {
    height:        32px;
    padding:       0 0.9rem;
    border-radius: 8px;
    border:        1.5px solid #9b7ef8;
    background:    transparent;
    color:         #7c5cf5;
    font-family:   'DM Sans', sans-serif;
    font-size:     0.78rem;
    font-weight:   600;
    cursor:        pointer;
    white-space:   nowrap;
    transition:    background .18s;
  }
  .EP-upload-btn:hover { background: #f0ecff; }

  .EP-photo-hint {
    font-size:   0.75rem;
    color:       #e05c5c;
    margin:      0;
    text-align:  center;
    display:     flex;
    align-items: center;
    gap:         4px;
  }

  /* Right fields column */
  .EP-fields-col {
    flex:    1;
    display: flex;
    flex-direction: column;
    gap:     1rem;
    min-width: 0;
  }

  /* Section label */
  .EP-section-label {
    font-size:      0.7rem;
    font-weight:    600;
    letter-spacing: .09em;
    text-transform: uppercase;
    color:          #b8aedd;
    margin-bottom:  1rem;
  }

  /* Grid layouts */
  .EP-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.85rem;
  }

  .EP-row-addr {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 0.85rem;
    margin-bottom: 0.85rem;
  }

  .EP-row-3 {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: 0.85rem;
    margin-bottom: 0;
  }

  /* Field */
  .EP-field {
    display:        flex;
    flex-direction: column;
    gap:            0.3rem;
  }

  .EP-label {
    font-size:   0.8rem;
    font-weight: 500;
    color:       #4b4070;
  }

  .EP-required { color: #7c5cf5; }

  /* Input */
  .EP-input {
    height:        42px;
    padding:       0 0.9rem;
    border:        1.5px solid #e0d9f5;
    border-radius: 8px;
    font-family:   'DM Sans', sans-serif;
    font-size:     0.875rem;
    color:         #1a1530;
    background:    #faf9ff;
    outline:       none;
    width:         100%;
    box-sizing:    border-box;
    transition:    border-color .2s, box-shadow .2s, background .2s;
  }
  .EP-input::placeholder { color: #c4bad8; }
  .EP-input:hover  { border-color: #c0adf5; background: #fff; }
  .EP-input:focus  { border-color: #9b7ef8; background: #fff; box-shadow: 0 0 0 3px rgba(155,126,248,.1); }
  .EP-input--err   { border-color: #e05c5c !important; box-shadow: 0 0 0 3px rgba(224,92,92,.08) !important; }

  /* Input with icon */
  .EP-input-icon-wrap { position: relative; }
  .EP-input-icon-wrap .EP-input { padding-right: 2.5rem; }
  .EP-input-icon {
    position:  absolute;
    right:     0.75rem;
    top:       50%;
    transform: translateY(-50%);
    color:     #b8aedd;
    pointer-events: none;
  }

  /* Select */
  .EP-select-wrap { position: relative; }
  .EP-select {
    appearance: none;
    height:        42px;
    padding:       0 2.2rem 0 0.9rem;
    border:        1.5px solid #e0d9f5;
    border-radius: 8px;
    font-family:   'DM Sans', sans-serif;
    font-size:     0.875rem;
    color:         #1a1530;
    background:    #faf9ff;
    outline:       none;
    width:         100%;
    cursor:        pointer;
    transition:    border-color .2s;
  }
  .EP-select:focus { border-color: #9b7ef8; box-shadow: 0 0 0 3px rgba(155,126,248,.1); }
  .EP-select-arrow {
    position:  absolute;
    right:     0.75rem;
    top:       50%;
    transform: translateY(-50%);
    color:     #b8aedd;
    font-size: 0.7rem;
    pointer-events: none;
  }

  /* Phone */
  .EP-phone-wrap {
    display: flex;
    gap:     0.5rem;
  }

  .EP-phone-code-wrap {
    position:   relative;
    flex-shrink: 0;
    width:      110px;
  }

  .EP-phone-code {
    appearance:    none;
    height:        42px;
    padding:       0 2rem 0 0.75rem;
    border:        1.5px solid #e0d9f5;
    border-radius: 8px;
    font-family:   'DM Sans', sans-serif;
    font-size:     0.855rem;
    color:         #1a1530;
    background:    #faf9ff;
    outline:       none;
    width:         100%;
    cursor:        pointer;
  }
  .EP-phone-code:focus { border-color: #9b7ef8; }

  .EP-phone-input { flex: 1; }

  /* Error */
  .EP-error {
    display:     flex;
    align-items: center;
    gap:         5px;
    font-size:   0.75rem;
    font-weight: 500;
    color:       #e05c5c;
  }

  .EP-error-dot {
    display:         inline-flex;
    align-items:     center;
    justify-content: center;
    width:           14px;
    height:          14px;
    border-radius:   50%;
    background:      #e05c5c;
    color:           #fff;
    font-size:       0.65rem;
    font-weight:     700;
    flex-shrink:     0;
  }

  /* Actions */
  .EP-actions {
    display:         flex;
    justify-content: space-between;
    align-items:     center;
    margin-top:      0.25rem;
  }

  .EP-btn {
    height:        44px;
    padding:       0 1.5rem;
    border-radius: 10px;
    font-family:   'DM Sans', sans-serif;
    font-size:     0.9rem;
    font-weight:   600;
    cursor:        pointer;
    border:        none;
    transition:    opacity .18s, transform .14s, box-shadow .18s;
  }
  .EP-btn:active:not(:disabled) { transform: scale(0.97); }
  .EP-btn:disabled               { opacity: .4; cursor: not-allowed; }

  .EP-btn--back {
    background: #f3f0fc;
    color:      #6b5fa0;
    border:     1.5px solid #e0d9f5;
  }
  .EP-btn--back:hover:not(:disabled) { background: #ebe6fa; }

  .EP-btn--submit {
    background: linear-gradient(135deg, #7c5cf5, #ae6ed4);
    color:      #fff;
    box-shadow: 0 2px 16px rgba(124,92,245,.35);
  }
  .EP-btn--submit:hover:not(:disabled) { opacity:.9; box-shadow: 0 4px 22px rgba(124,92,245,.5); }

  /* Responsive */
  @media (max-width: 600px) {
    .EP-top-row   { flex-direction: column; align-items: center; }
    .EP-photo-col { width: 100%; }
    .EP-row-2,
    .EP-row-addr,
    .EP-row-3     { grid-template-columns: 1fr; }
    .EP-card      { padding: 1.75rem 1.25rem; }
  }
`;

export default EditProfile;