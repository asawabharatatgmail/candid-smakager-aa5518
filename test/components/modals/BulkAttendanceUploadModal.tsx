import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Student, Subject, AttendanceRecord } from '../../types';

const CSV_TEMPLATE = "student_name,date,status,subject_name";

const BulkAttendanceUploadModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { students, subjects, addBulkAttendance } = useAppContext();
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
            setResults(null);
        }
    };

    const handleUpload = () => {
        if (!file) {
            setError('Please select a CSV file.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResults(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.trim().replace(/\r/g, '').split('\n');
                if (lines.length <= 1) {
                    throw new Error("CSV is empty or has no data rows.");
                }

                const records: Omit<AttendanceRecord, 'id'>[] = [];
                const errors: string[] = [];

                const studentsByName = new Map(students.map(s => [s.name.toLowerCase(), s]));
                const subjectsByName = new Map(subjects.map(s => [s.name.toLowerCase(), s]));

                lines.slice(1).forEach((line, index) => {
                    if (!line.trim()) return; // Skip empty lines
                    const [studentName, date, status, subjectName] = line.split(',').map(s => s.trim());

                    const student = studentsByName.get(studentName?.toLowerCase());
                    const subject = subjectsByName.get(subjectName?.toLowerCase());

                    if (!student) {
                        errors.push(`Row ${index + 2}: Student "${studentName}" not found.`);
                        return;
                    }
                    if (!subject) {
                        errors.push(`Row ${index + 2}: Subject "${subjectName}" not found.`);
                        return;
                    }
                    if (!['Present', 'Absent', 'Late'].includes(status)) {
                        errors.push(`Row ${index + 2}: Invalid status "${status}". Must be Present, Absent, or Late.`);
                        return;
                    }
                     if (isNaN(new Date(date).getTime())) {
                        errors.push(`Row ${index + 2}: Invalid date format "${date}". Please use YYYY-MM-DD.`);
                        return;
                    }

                    records.push({
                        studentId: student.id,
                        subjectId: subject.id,
                        date: new Date(date).toISOString().split('T')[0],
                        status: status as 'Present' | 'Absent' | 'Late',
                    });
                });

                if (records.length > 0) {
                    addBulkAttendance(records);
                }
                setResults({ success: records.length, errors });

            } catch (err: any) {
                setError(`Failed to process CSV file: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setError('Failed to read the file.');
            setIsLoading(false);
        }
        reader.readAsText(file);
    };

    const handleDownloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `attendance_template.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-scale-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Bulk Upload Attendance</h2>
                {!results ? (
                    <>
                        <p className="text-sm text-slate-500">Upload a CSV file with student attendance records. The file must match the structure of the provided template.</p>
                        <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <p className="text-sm font-semibold text-slate-600">Required format:</p>
                            <code className="text-xs text-amber-600">{CSV_TEMPLATE}</code>
                        </div>
                        <button onClick={handleDownloadTemplate} className="text-sm text-indigo-600 hover:underline font-medium mb-4">Download Template</button>
                        <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-600 hover:file:bg-indigo-500/20" />
                        
                        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

                        <div className="mt-6 flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200">Cancel</button>
                            <button onClick={handleUpload} disabled={isLoading || !file} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400">
                                {isLoading ? 'Processing...' : 'Upload & Save'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Upload Complete</h3>
                        <p className="text-green-600 font-semibold">{results.success} records processed successfully.</p>
                        {results.errors.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold text-red-600">Errors ({results.errors.length}):</h4>
                                <ul className="text-sm text-red-600 list-disc list-inside max-h-40 overflow-y-auto bg-slate-50 p-2 rounded-md mt-2 border border-slate-200">
                                    {results.errors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkAttendanceUploadModal;