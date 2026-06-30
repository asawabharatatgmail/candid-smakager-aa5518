import React, { useState, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ThemeSettings } from '../../types';

// ── Preset Themes ─────────────────────────────────────────────────────────────
const PRESETS: { name: string; emoji: string; theme: ThemeSettings }[] = [
  {
    name: 'System4Learn (Default)', emoji: '🎓',
    theme: { primaryColor: '#2563EB', primaryHover: '#1D4ED8', primaryLight: '#EFF6FF', sidebarFrom: '#1E1B4B', sidebarTo: '#312E81', headingFont: 'Inter', bodyFont: 'Inter', borderRadius: '0.875rem', surface: '#FFFFFF', surface3: '#F5F7FB', textPrimary: '#111827', borderColor: '#D1D5DB' },
  },
  {
    name: 'Stripe Enterprise', emoji: '💼',
    theme: { primaryColor: '#635BFF', primaryHover: '#5144E8', primaryLight: '#F0EFFE', sidebarFrom: '#0A2540', sidebarTo: '#1a3a5c', headingFont: 'Inter', bodyFont: 'Inter', borderRadius: '0.5rem', surface: '#FFFFFF', surface3: '#F6F9FC', textPrimary: '#0A2540', borderColor: '#E0E6EB' },
  },
  {
    name: 'Linear Dark', emoji: '🌙',
    theme: { primaryColor: '#5E6AD2', primaryHover: '#4E59C0', primaryLight: '#EEEFFE', sidebarFrom: '#111118', sidebarTo: '#1A1A2E', headingFont: 'Inter', bodyFont: 'Inter', borderRadius: '0.5rem', surface: '#1C1C27', surface3: '#111118', textPrimary: '#F4F4F7', borderColor: '#2E2E42' },
  },
  {
    name: 'Notion Clean', emoji: '📝',
    theme: { primaryColor: '#2383E2', primaryHover: '#0F73D9', primaryLight: '#EBF5FC', sidebarFrom: '#FFFFFF', sidebarTo: '#F7F7F5', headingFont: 'Inter', bodyFont: 'Inter', borderRadius: '0.375rem', surface: '#FFFFFF', surface3: '#F7F7F5', textPrimary: '#37352F', borderColor: '#E8E8E5' },
  },
  {
    name: 'Ocean Blue', emoji: '🌊',
    theme: { primaryColor: '#0284c7', primaryHover: '#0369a1', primaryLight: '#e0f2fe', sidebarFrom: '#0c1a2e', sidebarTo: '#0369a1', headingFont: 'Plus Jakarta Sans', bodyFont: 'Inter', borderRadius: '0.75rem', surface: '#ffffff', surface3: '#f0f9ff', textPrimary: '#0c1a2e', borderColor: '#bae6fd' },
  },
  {
    name: 'Forest Green', emoji: '🌿',
    theme: { primaryColor: '#059669', primaryHover: '#047857', primaryLight: '#d1fae5', sidebarFrom: '#064e3b', sidebarTo: '#065f46', headingFont: 'Nunito', bodyFont: 'Nunito', borderRadius: '1rem', surface: '#ffffff', surface3: '#f0fdf4', textPrimary: '#052e16', borderColor: '#a7f3d0' },
  },
  {
    name: 'Sunset Orange', emoji: '🌅',
    theme: { primaryColor: '#ea580c', primaryHover: '#c2410c', primaryLight: '#fff7ed', sidebarFrom: '#431407', sidebarTo: '#7c2d12', headingFont: 'Poppins', bodyFont: 'Poppins', borderRadius: '0.75rem', surface: '#ffffff', surface3: '#fff7ed', textPrimary: '#1c0a00', borderColor: '#fed7aa' },
  },
  {
    name: 'Royal Purple', emoji: '👑',
    theme: { primaryColor: '#7c3aed', primaryHover: '#6d28d9', primaryLight: '#ede9fe', sidebarFrom: '#2e1065', sidebarTo: '#4c1d95', headingFont: 'Plus Jakarta Sans', bodyFont: 'Inter', borderRadius: '1rem', surface: '#ffffff', surface3: '#faf5ff', textPrimary: '#1e0050', borderColor: '#ddd6fe' },
  },
  {
    name: 'Rose Pink', emoji: '🌸',
    theme: { primaryColor: '#e11d48', primaryHover: '#be123c', primaryLight: '#fff1f2', sidebarFrom: '#4c0519', sidebarTo: '#881337', headingFont: 'Nunito', bodyFont: 'Nunito', borderRadius: '1.25rem', surface: '#ffffff', surface3: '#fff1f2', textPrimary: '#1c0007', borderColor: '#fecdd3' },
  },
  {
    name: 'Midnight Dark', emoji: '🌙',
    theme: { primaryColor: '#6366f1', primaryHover: '#4f46e5', primaryLight: '#e0e7ff', sidebarFrom: '#020617', sidebarTo: '#0f172a', headingFont: 'Inter', bodyFont: 'Inter', borderRadius: '0.5rem', surface: '#1e293b', surface3: '#0f172a', textPrimary: '#f1f5f9', borderColor: '#334155' },
  },
  {
    name: 'Golden Amber', emoji: '✨',
    theme: { primaryColor: '#d97706', primaryHover: '#b45309', primaryLight: '#fffbeb', sidebarFrom: '#451a03', sidebarTo: '#78350f', headingFont: 'Poppins', bodyFont: 'Inter', borderRadius: '0.625rem', surface: '#ffffff', surface3: '#fffbeb', textPrimary: '#1c0a00', borderColor: '#fde68a' },
  },
];

const FONTS = ['Inter', 'Plus Jakarta Sans', 'Poppins', 'Nunito', 'Lato', 'Roboto', 'Montserrat', 'Raleway'];
const RADII = [
  { label: 'Sharp', value: '0.25rem', preview: '4px' },
  { label: 'Subtle', value: '0.5rem', preview: '8px' },
  { label: 'Default', value: '0.75rem', preview: '12px' },
  { label: 'Soft', value: '0.875rem', preview: '14px' },
  { label: 'Rounded', value: '1rem', preview: '16px' },
  { label: 'Pill', value: '1.5rem', preview: '24px' },
];

// ── Color Picker Row ──────────────────────────────────────────────────────────
const ColorRow: React.FC<{ label: string; sublabel: string; value: string; onChange: (v: string) => void }> = ({ label, sublabel, value, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-xs text-slate-500">{sublabel}</p>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-slate-500 uppercase hidden sm:block">{value}</span>
      <div className="relative">
        <div
          className="w-9 h-9 rounded-xl border-2 border-slate-200 shadow-sm cursor-pointer overflow-hidden"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          title={label}
        />
      </div>
    </div>
  </div>
);

// ── Live Mini-Preview ─────────────────────────────────────────────────────────
const MiniPreview: React.FC<{ theme: ThemeSettings }> = ({ theme }) => (
  <div
    className="rounded-2xl border border-slate-200 overflow-hidden shadow-lg"
    style={{ fontFamily: `'${theme.bodyFont}', sans-serif`, backgroundColor: theme.surface3 }}
  >
    {/* Fake sidebar strip */}
    <div className="flex h-40">
      <div
        className="w-14 flex flex-col items-center py-3 gap-2 flex-shrink-0"
        style={{ background: `linear-gradient(180deg, ${theme.sidebarFrom} 0%, ${theme.sidebarTo} 100%)` }}
      >
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center mb-1">
          <i className="ri-graduation-cap-line text-white text-xs" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`w-8 h-1.5 rounded-full ${i === 0 ? 'bg-white/80' : 'bg-white/30'}`} />
        ))}
      </div>

      {/* Fake content area */}
      <div className="flex-1 p-3 space-y-2">
        {/* Fake header */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-2 w-20 rounded-full bg-slate-200" />
          <div className="h-5 w-16 rounded-lg" style={{ backgroundColor: theme.primaryColor }} />
        </div>
        {/* Fake card */}
        <div
          className="rounded-xl p-2.5 border shadow-sm"
          style={{ backgroundColor: theme.surface, borderColor: theme.borderColor, borderRadius: theme.borderRadius }}
        >
          <div className="h-1.5 w-16 rounded-full mb-1.5" style={{ backgroundColor: theme.textPrimary, opacity: 0.8 }} />
          <div className="h-1 w-24 rounded-full mb-2" style={{ backgroundColor: theme.textPrimary, opacity: 0.3 }} />
          <div className="flex gap-1">
            <div className="h-5 w-12 rounded-lg" style={{ backgroundColor: theme.primaryColor }} />
            <div className="h-5 w-14 rounded-lg border" style={{ backgroundColor: theme.primaryLight, borderColor: `${theme.primaryColor}44` }} />
          </div>
        </div>
        {/* Fake stat row */}
        <div className="grid grid-cols-3 gap-1.5">
          {[theme.primaryColor, theme.primaryHover, theme.primaryLight].map((c, i) => (
            <div key={i} className="rounded-lg p-1.5" style={{ backgroundColor: i === 2 ? theme.surface : c, border: i === 2 ? `1px solid ${theme.borderColor}` : 'none' }}>
              <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: i === 2 ? theme.textPrimary : 'rgba(255,255,255,0.7)', opacity: 0.6 }} />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Preview label */}
    <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between" style={{ backgroundColor: theme.surface }}>
      <p className="text-xs font-semibold" style={{ color: theme.textPrimary, fontFamily: `'${theme.headingFont}', sans-serif` }}>Live Preview</p>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
        <div className="w-1.5 h-1.5 rounded-full opacity-50" style={{ backgroundColor: theme.primaryColor }} />
        <div className="w-1.5 h-1.5 rounded-full opacity-25" style={{ backgroundColor: theme.primaryColor }} />
      </div>
    </div>
  </div>
);

// ── Section Wrapper ───────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2.5">
      <i className={`${icon} text-base text-indigo-600`} />
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
    </div>
    <div className="px-5 py-1">{children}</div>
  </div>
);

// ── Main View ─────────────────────────────────────────────────────────────────
const ThemeCustomizerView: React.FC = () => {
  const { themeSettings, updateTheme, resetTheme } = useAppContext();
  const [saved, setSaved] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const set = useCallback((key: keyof ThemeSettings, value: string) => {
    updateTheme({ [key]: value });
    setActivePreset(null);
  }, [updateTheme]);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    updateTheme(preset.theme);
    setActivePreset(preset.name);
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    resetTheme();
    setActivePreset('System4Learn (Default)');
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-md">
            <i className="ri-palette-line text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Theme Customizer</h1>
            <p className="text-sm text-slate-500">Brand colours, fonts & styles — changes apply instantly across the platform</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <i className="ri-refresh-line" /> Reset to Default
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {saved ? <><i className="ri-checkbox-circle-fill" /> Saved!</> : <><i className="ri-save-line" /> Save Theme</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left Column: Presets + Live Preview ── */}
        <div className="space-y-6">

          {/* Live Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2.5">
              <i className="ri-eye-line text-base text-violet-600" />
              <h3 className="text-sm font-bold text-slate-900">Live Preview</h3>
            </div>
            <div className="p-4">
              <MiniPreview theme={themeSettings} />
            </div>
          </div>

          {/* Preset Themes */}
          <Section title="Preset Themes" icon="ri-magic-line">
            <div className="py-2 grid grid-cols-1 gap-1.5">
              {PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${activePreset === preset.name ? 'bg-indigo-50 border-2 border-indigo-300' : 'hover:bg-slate-50 border-2 border-transparent'}`}
                >
                  {/* Color dots */}
                  <div className="flex gap-1 flex-shrink-0">
                    {[preset.theme.primaryColor, preset.theme.sidebarFrom, preset.theme.surface3].map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-slate-200/50" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{preset.emoji} {preset.name}</p>
                    <p className="text-xs text-slate-500 truncate">{preset.theme.headingFont} · {preset.theme.borderRadius} radius</p>
                  </div>
                  {activePreset === preset.name && (
                    <i className="ri-checkbox-circle-fill text-indigo-600 ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Right Two Columns: Settings ── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Brand Colors */}
          <Section title="Brand Colors" icon="ri-drop-line">
            <ColorRow
              label="Primary Color"
              sublabel="Buttons, links, active states, highlights"
              value={themeSettings.primaryColor}
              onChange={v => set('primaryColor', v)}
            />
            <ColorRow
              label="Primary Hover"
              sublabel="Hover state on primary buttons"
              value={themeSettings.primaryHover}
              onChange={v => set('primaryHover', v)}
            />
            <ColorRow
              label="Primary Light"
              sublabel="Secondary buttons, badge backgrounds, hover fills"
              value={themeSettings.primaryLight}
              onChange={v => set('primaryLight', v)}
            />
            <ColorRow
              label="Text Color"
              sublabel="Main headings and body text"
              value={themeSettings.textPrimary}
              onChange={v => set('textPrimary', v)}
            />
            <ColorRow
              label="Border Color"
              sublabel="Card borders, dividers, input borders"
              value={themeSettings.borderColor}
              onChange={v => set('borderColor', v)}
            />
          </Section>

          {/* Surface Colors */}
          <Section title="Surface & Background Colors" icon="ri-layout-2-line">
            <ColorRow
              label="Card / Panel Background"
              sublabel="White cards and modals surface"
              value={themeSettings.surface}
              onChange={v => set('surface', v)}
            />
            <ColorRow
              label="Page Background"
              sublabel="The main page/app background color"
              value={themeSettings.surface3}
              onChange={v => set('surface3', v)}
            />
          </Section>

          {/* Sidebar Gradient */}
          <Section title="Sidebar Gradient" icon="ri-sidebar-unfold-line">
            <ColorRow
              label="Gradient Start (Top)"
              sublabel="Top color of the sidebar gradient"
              value={themeSettings.sidebarFrom}
              onChange={v => set('sidebarFrom', v)}
            />
            <ColorRow
              label="Gradient End (Bottom)"
              sublabel="Bottom color of the sidebar gradient"
              value={themeSettings.sidebarTo}
              onChange={v => set('sidebarTo', v)}
            />
            {/* Sidebar preview strip */}
            <div className="py-3">
              <div
                className="h-12 w-full rounded-xl flex items-center px-4 gap-3"
                style={{ background: `linear-gradient(90deg, ${themeSettings.sidebarFrom} 0%, ${themeSettings.sidebarTo} 100%)` }}
              >
                <i className="ri-graduation-cap-line text-white" />
                <span className="text-white text-xs font-semibold">Sidebar Preview</span>
                <div className="ml-auto flex gap-1.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-4 h-1 rounded-full bg-white/40" />
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Typography */}
          <Section title="Typography & Fonts" icon="ri-text">
            <div className="py-3 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Heading Font
                  <span className="ml-2 text-xs font-normal text-slate-400">— Used in titles and card headers</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FONTS.map(font => (
                    <button
                      key={font}
                      onClick={() => set('headingFont', font)}
                      className={`px-3 py-2.5 rounded-xl border-2 text-left transition-all ${themeSettings.headingFont === font ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                    >
                      <p className="text-xs font-bold text-slate-800 truncate" style={{ fontFamily: `'${font}', sans-serif` }}>{font}</p>
                      <p className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: `'${font}', sans-serif` }}>AaBbCc</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Body Font
                  <span className="ml-2 text-xs font-normal text-slate-400">— Paragraphs, labels, tables</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FONTS.map(font => (
                    <button
                      key={font}
                      onClick={() => set('bodyFont', font)}
                      className={`px-3 py-2.5 rounded-xl border-2 text-left transition-all ${themeSettings.bodyFont === font ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                    >
                      <p className="text-xs font-bold text-slate-800 truncate" style={{ fontFamily: `'${font}', sans-serif` }}>{font}</p>
                      <p className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: `'${font}', sans-serif` }}>AaBbCc</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Border Radius */}
          <Section title="Corner Roundness" icon="ri-rounded-corner">
            <div className="py-3">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {RADII.map(r => (
                  <button
                    key={r.value}
                    onClick={() => set('borderRadius', r.value)}
                    className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${themeSettings.borderRadius === r.value ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    <div
                      className="w-8 h-8 bg-blue-600"
                      style={{ borderRadius: r.value }}
                    />
                    <p className="text-xs font-semibold text-slate-700">{r.label}</p>
                    <p className="text-xs text-slate-400">{r.preview}</p>
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Current Theme Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5">
            <p className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <i className="ri-code-line" /> Current Theme CSS Variables
            </p>
            <pre className="text-xs text-slate-700 font-mono bg-white rounded-xl p-3 border border-slate-200 overflow-x-auto leading-relaxed">
{`--primary:  ${themeSettings.primaryColor}
--hover:    ${themeSettings.primaryHover}
--light:    ${themeSettings.primaryLight}
--sidebar:  ${themeSettings.sidebarFrom} → ${themeSettings.sidebarTo}
--font-h:   '${themeSettings.headingFont}'
--font-b:   '${themeSettings.bodyFont}'
--radius:   ${themeSettings.borderRadius}
--surface:  ${themeSettings.surface}
--bg:       ${themeSettings.surface3}
--text:     ${themeSettings.textPrimary}`}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizerView;
