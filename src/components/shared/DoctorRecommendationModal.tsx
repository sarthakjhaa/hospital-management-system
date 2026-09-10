'use client';

import { useState } from 'react';
import { Sparkles, Search, Star, Calendar, X, CheckCircle2, Stethoscope } from 'lucide-react';
import { formatINR } from '@/lib/doctorUtils';

interface DoctorRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoctor: (doctorId: string) => void;
}

export default function DoctorRecommendationModal({
  isOpen,
  onClose,
  onSelectDoctor,
}: DoctorRecommendationModalProps) {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/doctors/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      });

      const data = await res.json();
      setResults(data.recommendations || []);
    } catch (err) {
      console.error('Recommendation search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl relative max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Find Doctor by Symptoms</h3>
              <p className="text-xs text-slate-500 font-medium">Describe your symptoms to match specialists</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              required
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Chest pain, severe headache, child fever, knee joint pain..."
              className="w-full pl-11 pr-28 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-sm"
            />
            <Search className="h-5 w-5 text-slate-400 absolute left-4 top-4" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" /> Find Doctors
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[11px] text-slate-500 font-semibold">Try keywords:</span>
            {['Chest pain', 'Headache', 'Child fever', 'Knee pain'].map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => {
                  setSymptoms(kw);
                }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[11px] text-slate-700 rounded-lg transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </form>

        {/* Results List */}
        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {results.length > 0 ? (
            results.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl border border-blue-200 shrink-0">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{doc.user?.name}</h4>
                      {doc.symptomMatched && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-md">
                          Matched
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 font-semibold">{doc.specialty} • {doc.department?.name}</p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">{doc.bio}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {doc.rating}
                      </span>
                      <span>Fee: <strong className="text-slate-900 font-mono font-bold">{formatINR(doc.consultationFee)}</strong></span>
                      <span className="text-slate-500">{doc.availability}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectDoctor(doc.id);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Calendar className="h-4 w-4" /> Book Consultation
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Enter symptoms above to find matched specialist doctors.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
