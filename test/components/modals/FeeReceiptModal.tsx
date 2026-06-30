import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAppContext } from '../../context/AppContext';
import { FeeReceipt } from '../../types';

interface FeeReceiptModalProps {
  receipt: FeeReceipt;
  onClose: () => void;
}

const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({ receipt, onClose }) => {
  const { activeInstitute, getContextData } = useAppContext();
  const student = getContextData('students', receipt.studentId);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    const input = receiptRef.current;
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`receipt-${receipt.receiptNumber}.pdf`);
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-scale-in">
        <div ref={receiptRef} className="p-8 bg-white text-gray-800">
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b">
            <div className="flex items-center">
              {activeInstitute?.logoUrl && (
                <img src={activeInstitute.logoUrl} alt="Institute Logo" className="h-16 w-16 mr-4 object-contain" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{activeInstitute?.name}</h2>
                <p className="text-xs text-gray-500">{activeInstitute?.address}</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-semibold text-gray-700">PAYMENT RECEIPT</h3>
              <p className="text-sm text-gray-500">Receipt #: {receipt.receiptNumber}</p>
            </div>
          </div>
          {/* Bill To */}
          <div className="flex justify-between mt-6">
            <div>
              <p className="text-sm font-semibold text-gray-600">BILLED TO</p>
              <p className="text-lg font-bold text-gray-800">{student?.name}</p>
              <p className="text-sm text-gray-600">{student?.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-600">Payment Date</p>
              <p className="text-md text-gray-800">{new Date(receipt.paymentDate).toLocaleDateString()}</p>
              <p className="text-sm font-semibold text-gray-600 mt-2">Payment Mode</p>
              <p className="text-md text-gray-800">{receipt.paymentMode}</p>
            </div>
          </div>
          {/* Items Table */}
          <div className="mt-8">
            <table className="min-w-full">
              <thead className="border-b">
                <tr>
                  <th className="py-2 text-left text-sm font-semibold text-gray-600 uppercase">Description</th>
                  <th className="py-2 text-right text-sm font-semibold text-gray-600 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {receipt.breakdown.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 text-md text-gray-700">{item.description}</td>
                    <td className="py-3 text-right text-md text-gray-700">₹{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-3 text-right font-bold text-lg text-gray-800">Total Paid</td>
                  <td className="py-3 text-right font-bold text-lg text-gray-800">₹{receipt.amountPaid.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500 border-t pt-4">
            <p>Thank you for your payment!</p>
            <p>{activeInstitute?.name} | {activeInstitute?.tagline}</p>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeReceiptModal;