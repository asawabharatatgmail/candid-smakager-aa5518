import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ManagementCategory } from '../../types';
import { MANAGEMENT_CONFIG } from '../../constants';

const parseCSV = (text: string): any[] => {
  const lines = text.trim().replace(/\r/g, '').split('\n');
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map(h => h.trim().split('(')[0]);
  return lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const obj: any = {};
    header.forEach((h, i) => {
      let value = (values[i] || '').trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      obj[h] = h.endsWith('Ids') ? (value ? value.split(';').map(id => id.trim()).filter(Boolean) : []) : value;
    });
    return obj;
  });
};

interface BulkUploadModalProps {
  category: ManagementCategory;
  onClose: () => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ category, onClose }) => {
  const { addBulkRecords, csvTemplates } = useAppContext();
  const config = MANAGEMENT_CONFIG[category];
  const csvTemplate = csvTemplates[category] || config.csvTemplate;
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setFile(e.target.files[0]); setError(''); setSuccess(''); }
  };

  const handleUpload = () => {
    if (!file) { setError('Please select a CSV file.'); return; }
    setIsLoading(true); setError(''); setSuccess('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = parseCSV(e.target?.result as string);
        if (data.length === 0) throw new Error('Empty or invalid CSV.');
        addBulkRecords(category, data);
        setSuccess(`${data.length} records uploaded successfully!`);
        setTimeout(onClose, 2000);
      } catch { setError('Failed to parse CSV. Please check the format.'); }
      finally { setIsLoading(false); }
    };
    reader.onerror = () => { setError('Failed to read the file.'); setIsLoading(false); };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csvTemplate], { type: 'text/csv' }));
    link.download = `${category}_template.csv`;
    link.click();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-lg animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">Bulk Upload {config.label}</h2>
          <button onClick={onClose} className="btn-icon"><i className="ri-close-line text-lg" /></button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Upload a CSV file matching the template structure. The template is configurable by the Product Owner.
          </p>

          <button onClick={handleDownloadTemplate} className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800">
            <i className="ri-download-line" /> Download CSV Template
          </button>

          <label className="block">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer">
              <i className="ri-upload-cloud-2-line text-3xl text-slate-400 mb-2 block" />
              <p className="text-sm font-medium text-slate-700">{file ? file.name : 'Click to select CSV file'}</p>
              <p className="text-xs text-slate-400 mt-1">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'CSV files only'}</p>
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </div>
          </label>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{success}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={handleUpload} disabled={isLoading || !file} className="btn-primary disabled:opacity-50">
              {isLoading ? 'Uploading…' : 'Upload & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
