import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ExternalChildProfile } from '../../types';
import { apiCreateChild, apiUpdateChild, apiDeleteChild } from '../../services/externalDataApi';

const GRADE_OPTIONS = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];
const SUBJECT_OPTIONS = ['Mathematics','Physics','Chemistry','Biology','English','Hindi','History','Geography','Civics','Economics','Computer Science','Social Science','Sanskrit','French','German'];

const ExternalChildrenView: React.FC = () => {
  const { externalChildren, setExternalChildren, currentUser, parentPlans, parentSubscriptions } = useAppContext();

  const myChildren = externalChildren.filter(c => c.parentId === currentUser?.id);
  const mySub    = parentSubscriptions.find(ps => ps.parentId === currentUser?.id && ps.status === 'active');
  const myPlan   = parentPlans.find(p => p.id === mySub?.planId);
  const maxChildren = myPlan?.maxChildren ?? 1;

  const [showForm, setShowForm]       = useState(false);
  const [editing, setEditing]         = useState<ExternalChildProfile | null>(null);
  const [form, setForm]               = useState<Partial<ExternalChildProfile>>({});
  const [subjectInput, setSubjectInput] = useState('');

  const openAdd = () => {
    setForm({ parentId: currentUser!.id, subjectsOfInterest: [], grade: 'Class 10', age: 14 });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (c: ExternalChildProfile) => {
    setForm(c);
    setEditing(c);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.grade) return;
    const child: ExternalChildProfile = {
      id:                  editing?.id ?? `ext_child_${Date.now()}`,
      parentId:            currentUser!.id,
      name:                form.name ?? '',
      grade:               form.grade ?? 'Class 10',
      age:                 Number(form.age ?? 14),
      subjectsOfInterest:  form.subjectsOfInterest ?? [],
      schoolName:          form.schoolName,
      city:                form.city,
      createdAt:           editing?.createdAt ?? new Date().toISOString().split('T')[0],
    };
    setExternalChildren(prev => editing
      ? prev.map(c => c.id === editing.id ? child : c)
      : [...prev, child]);
    setShowForm(false);

    // Best-effort backend sync — local state above already updated.
    const payload = {
      name: child.name, grade: child.grade, age: child.age,
      subjects_of_interest: child.subjectsOfInterest,
      school_name: child.schoolName ?? null, city: child.city ?? null,
    };
    if (editing) apiUpdateChild(editing.id, payload);
    else apiCreateChild(payload);
  };

  const handleRemove = (id: string) => {
    setExternalChildren(prev => prev.filter(c => c.id !== id));
    apiDeleteChild(id);
  };

  const toggleSubject = (subj: string) => {
    setForm(prev => {
      const curr = prev.subjectsOfInterest ?? [];
      return { ...prev, subjectsOfInterest: curr.includes(subj) ? curr.filter(s => s !== subj) : [...curr, subj] };
    });
  };

  const EMOJIS = ['👦', '👧', '🧒', '👶'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Children</h2>
          <p className="text-sm text-slate-500">{myChildren.length} / {maxChildren} child slots used · <span className="text-indigo-600 font-medium">{myPlan?.name ?? 'Free'} Plan</span></p>
        </div>
        {myChildren.length < maxChildren && (
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <span>+</span> Add Child
          </button>
        )}
      </div>

      {myChildren.length < maxChildren && myChildren.length === 0 && (
        <div className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-3">👶</div>
          <p className="font-bold text-indigo-800 text-lg">No children added yet</p>
          <p className="text-indigo-600 text-sm mt-1 mb-4">Add your child's profile with their grade and subjects to generate personalised AI content</p>
          <button onClick={openAdd} className="btn-primary text-sm">+ Add First Child</button>
        </div>
      )}

      {myChildren.length >= maxChildren && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-center justify-between">
          <p>You've used all {maxChildren} child slot(s) on your current plan.</p>
          <button className="text-amber-700 font-bold underline text-xs">Upgrade</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {myChildren.map((child, i) => (
          <div key={child.id} className="bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-200 p-5 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-2xl flex-shrink-0">
                  {EMOJIS[i % EMOJIS.length]}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{child.name}</p>
                  <p className="text-xs text-slate-400">{child.grade} · Age {child.age}</p>
                  {child.schoolName && <p className="text-xs text-slate-400">{child.schoolName}</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {child.subjectsOfInterest.map(s => (
                <span key={s} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">{s}</span>
              ))}
              {child.subjectsOfInterest.length === 0 && <span className="text-xs text-slate-400 italic">No subjects added</span>}
            </div>

            <div className="flex gap-2">
              <button onClick={() => openEdit(child)} className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors">✏️ Edit</button>
              <button onClick={() => handleRemove(child.id)} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-bold transition-colors">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-lg">{editing ? 'Edit Child' : 'Add Child Profile'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Child's Name *</label>
                <input type="text" value={form.name ?? ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Arjun" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Grade / Class *</label>
                  <select value={form.grade ?? 'Class 10'} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
                    {GRADE_OPTIONS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Age *</label>
                  <input type="number" min={5} max={20} value={form.age ?? 14} onChange={e => setForm(p => ({ ...p, age: parseInt(e.target.value) || 14 }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">School Name</label>
                  <input type="text" value={form.schoolName ?? ''} onChange={e => setForm(p => ({ ...p, schoolName: e.target.value }))}
                    placeholder="e.g. DPS Hyderabad" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">City</label>
                  <input type="text" value={form.city ?? ''} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                    placeholder="e.g. Mumbai" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Subjects of Interest</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_OPTIONS.map(s => (
                    <button key={s} type="button" onClick={() => toggleSubject(s)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors font-medium ${
                        form.subjectsOfInterest?.includes(s)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Selected: {form.subjectsOfInterest?.length ?? 0} subjects</p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleSave} className="btn-primary flex-1">Save Child</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalChildrenView;
