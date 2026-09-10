'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import {
  Stethoscope,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Globe,
  Award,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  getAllStatesAndUTs,
  getDistrictsForState,
  getCitiesForStateAndDistrict,
} from '@/lib/indianLocations';
import { formatINR, parseDoctorBio, formatDoctorName } from '@/lib/doctorUtils';

const SYMPTOM_MAPPINGS: Record<string, string[]> = {
  Cardiology: ['chest pain', 'heart', 'cardio', 'breathlessness', 'palpitations', 'blood pressure'],
  Dermatology: ['skin rash', 'acne', 'itching', 'skin', 'eczema', 'allergy', 'hair loss', 'psoriasis'],
  ENT: ['ear pain', 'throat', 'sinus', 'nasal', 'hearing', 'tonsils', 'vertigo', 'tinnitus'],
  Gastroenterology: ['stomach pain', 'acid reflux', 'jaundice', 'digestion', 'liver', 'ulcer', 'vomiting'],
  'General Medicine': ['fever', 'cough', 'cold', 'gastric', 'fatigue', 'flu', 'weakness', 'body ache'],
  'General Surgery': ['hernia', 'gallbladder', 'appendix', 'surgery', 'piles', 'abscess', 'wound'],
  'Gynecology & Obstetrics': ['pregnancy', 'period pain', 'menstrual', 'fibroids', 'PCOS', 'women health'],
  Nephrology: ['kidney pain', 'dialysis', 'urine protein', 'creatinine', 'swelling', 'kidney stone'],
  Neurology: ['headache', 'dizziness', 'migraine', 'numbness', 'seizure', 'paralysis', 'stroke', 'tremor'],
  Oncology: ['cancer', 'tumor', 'chemotherapy', 'radiation', 'biopsy', 'lump'],
  Ophthalmology: ['eye pain', 'blurry vision', 'cataract', 'glaucoma', 'red eye', 'sight', 'glasses'],
  Orthopedics: ['knee pain', 'joint pain', 'bone', 'fracture', 'back pain', 'arthritis', 'ligament'],
  Pediatrics: ['child fever', 'pediatric', 'infant', 'baby', 'kid', 'vaccination', 'growth'],
  Psychiatry: ['depression', 'anxiety', 'insomnia', 'stress', 'mental health', 'bipolar', 'panic'],
  Pulmonology: ['asthma', 'breathing problem', 'pneumonia', 'chronic cough', 'lungs', 'bronchitis'],
  Urology: ['urinary infection', 'prostate', 'urine blood', 'bladder', 'kidney stone'],
  Endocrinology: ['thyroid', 'diabetes', 'sugar level', 'hormone', 'obesity', 'metabolism'],
  Dentistry: ['toothache', 'cavity', 'bleeding gums', 'root canal', 'braces', 'dental'],
  Radiology: ['x-ray', 'mri', 'ct scan', 'ultrasound', 'scan', 'imaging'],
  Anesthesiology: ['anesthesia', 'pain management', 'sedation'],
  Pathology: ['blood test', 'lab test', 'biopsy test', 'pathology report'],
  Physiotherapy: ['physio', 'muscle stiffness', 'rehab', 'posture', 'back stretch', 'physical therapy'],
  'Emergency Medicine': ['trauma', 'accident', 'emergency', 'acute pain', 'severe injury'],
};

export default function DoctorFinderPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Cascading Filter State
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [languageFilter, setLanguageFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // Symptom Search State
  const [symptomInput, setSymptomInput] = useState('');
  const [matchedDept, setMatchedDept] = useState<string | null>(null);

  // Booking Modal State
  const [bookDoctor, setBookDoctor] = useState<any>(null);
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookTime, setBookTime] = useState('');
  const [bookReason, setBookReason] = useState('Specialist Consultation');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedApt, setConfirmedApt] = useState<any>(null);

  const fetchDoctorCatalog = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stateFilter !== 'ALL') params.set('state', stateFilter);
      if (districtFilter !== 'ALL') params.set('district', districtFilter);
      if (cityFilter !== 'ALL') params.set('city', cityFilter);
      if (hospitalFilter !== 'ALL') params.set('hospital', hospitalFilter);
      if (deptFilter !== 'ALL') params.set('departmentId', deptFilter);
      if (languageFilter !== 'ALL') params.set('language', languageFilter);
      if (search) params.set('query', search);

      const [docRes, deptRes] = await Promise.all([
        fetch(`/api/doctors?${params.toString()}`),
        fetch('/api/departments'),
      ]);

      if (docRes.ok) {
        const data = await docRes.json();
        setDoctors(data.doctors || []);
      }
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorCatalog();
  }, [stateFilter, districtFilter, cityFilter, hospitalFilter, deptFilter, languageFilter, search]);

  // Dynamic Location Cascading
  const allStates = getAllStatesAndUTs();
  const availableDistricts = stateFilter !== 'ALL' ? getDistrictsForState(stateFilter) : [];
  const availableCities =
    stateFilter !== 'ALL' && districtFilter !== 'ALL'
      ? getCitiesForStateAndDistrict(stateFilter, districtFilter)
      : [];

  // Compute available hospitals dynamically based on doctor profiles & current location filter
  const availableHospitals = useMemo(() => {
    return Array.from(
      new Set(
        doctors
          .filter((d) => {
            const meta = d.parsedMeta || parseDoctorBio(d.bio);
            const matchesState = stateFilter === 'ALL' || meta.state?.toLowerCase() === stateFilter.toLowerCase();
            const matchesDistrict = districtFilter === 'ALL' || meta.district?.toLowerCase() === districtFilter.toLowerCase();
            const matchesCity = cityFilter === 'ALL' || meta.city?.toLowerCase() === cityFilter.toLowerCase();
            return matchesState && matchesDistrict && matchesCity;
          })
          .map((d) => {
            const meta = d.parsedMeta || parseDoctorBio(d.bio);
            return meta.hospital;
          })
          .filter(Boolean)
      )
    ).sort();
  }, [doctors, stateFilter, districtFilter, cityFilter]);

  const availableLanguages = useMemo(() => {
    return Array.from(
      new Set(
        doctors.flatMap((d) => {
          const meta = d.parsedMeta || parseDoctorBio(d.bio);
          return meta.languages || [];
        })
      )
    ).sort();
  }, [doctors]);

  // Cascading Filter Handlers (Resets sub-filters and resets pagination page to 1)
  const handleStateChange = (newState: string) => {
    setStateFilter(newState);
    setDistrictFilter('ALL');
    setCityFilter('ALL');
    setHospitalFilter('ALL');
    setCurrentPage(1);
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrictFilter(newDistrict);
    setCityFilter('ALL');
    setHospitalFilter('ALL');
    setCurrentPage(1);
  };

  const handleCityChange = (newCity: string) => {
    setCityFilter(newCity);
    setHospitalFilter('ALL');
    setCurrentPage(1);
  };

  const handleHospitalChange = (newHospital: string) => {
    setHospitalFilter(newHospital);
    setCurrentPage(1);
  };

  const handleDeptChange = (newDept: string) => {
    setDeptFilter(newDept);
    setCurrentPage(1);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguageFilter(newLang);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setStateFilter('ALL');
    setDistrictFilter('ALL');
    setCityFilter('ALL');
    setHospitalFilter('ALL');
    setDeptFilter('ALL');
    setLanguageFilter('ALL');
    setSearch('');
    setSymptomInput('');
    setMatchedDept(null);
    setCurrentPage(1);
  };

  // Symptom Matcher Handler
  const handleMatchSymptoms = () => {
    if (!symptomInput.trim()) {
      setMatchedDept(null);
      return;
    }

    const query = symptomInput.toLowerCase();
    let foundDept: string | null = null;

    for (const [dept, keywords] of Object.entries(SYMPTOM_MAPPINGS)) {
      if (keywords.some((kw) => query.includes(kw))) {
        foundDept = dept;
        break;
      }
    }

    if (foundDept) {
      setMatchedDept(foundDept);
      handleDeptChange(foundDept);
    } else {
      setMatchedDept('General Medicine');
      handleDeptChange('General Medicine');
    }
  };

  // Multi-Tier Fallback Filter Logic
  const { filteredDoctors, fallbackBanner } = useMemo(() => {
    const filterFn = (
      doc: any,
      opts: { checkCity?: boolean; checkHospital?: boolean; checkDistrict?: boolean; checkState?: boolean }
    ) => {
      const meta = doc.parsedMeta || parseDoctorBio(doc.bio);
      const searchLower = search.toLowerCase().trim();

      const matchesSearch =
        !searchLower ||
        doc.user?.name?.toLowerCase().includes(searchLower) ||
        doc.specialty?.toLowerCase().includes(searchLower) ||
        doc.department?.name?.toLowerCase().includes(searchLower) ||
        meta.hospital?.toLowerCase().includes(searchLower) ||
        meta.state?.toLowerCase().includes(searchLower) ||
        meta.district?.toLowerCase().includes(searchLower) ||
        meta.city?.toLowerCase().includes(searchLower) ||
        meta.languages?.some((l: string) => l.toLowerCase().includes(searchLower));

      const matchesState = !opts.checkState || stateFilter === 'ALL' || meta.state?.toLowerCase() === stateFilter.toLowerCase();
      const matchesDistrict = !opts.checkDistrict || districtFilter === 'ALL' || meta.district?.toLowerCase() === districtFilter.toLowerCase();
      const matchesCity = !opts.checkCity || cityFilter === 'ALL' || meta.city?.toLowerCase() === cityFilter.toLowerCase();
      const matchesHospital = !opts.checkHospital || hospitalFilter === 'ALL' || meta.hospital?.toLowerCase() === hospitalFilter.toLowerCase();

      const matchesDept =
        deptFilter === 'ALL' ||
        doc.department?.name?.toLowerCase() === deptFilter.toLowerCase() ||
        doc.specialty?.toLowerCase() === deptFilter.toLowerCase();

      const matchesLang =
        languageFilter === 'ALL' ||
        meta.languages?.some((l: string) => l.toLowerCase() === languageFilter.toLowerCase());

      return matchesSearch && matchesState && matchesDistrict && matchesCity && matchesHospital && matchesDept && matchesLang;
    };

    // Tier 1: Exact Matches (all active filters)
    const exact = doctors.filter((doc) =>
      filterFn(doc, { checkState: true, checkDistrict: true, checkCity: true, checkHospital: true })
    );
    if (exact.length > 0) {
      return { filteredDoctors: exact, fallbackBanner: null };
    }

    // Tier 2: District-Level Fallback
    if (districtFilter !== 'ALL' || stateFilter !== 'ALL') {
      const distMatches = doctors.filter((doc) =>
        filterFn(doc, { checkState: true, checkDistrict: true, checkCity: false, checkHospital: false })
      );
      if (distMatches.length > 0) {
        const locName = districtFilter !== 'ALL' ? `${districtFilter} district` : stateFilter;
        const deptName = deptFilter !== 'ALL' ? `${deptFilter} specialists` : 'doctors';
        return {
          filteredDoctors: distMatches,
          fallbackBanner: `Showing ${deptName} available in ${locName}.`,
        };
      }
    }

    // Tier 3: State-Level Fallback
    if (stateFilter !== 'ALL') {
      const stateMatches = doctors.filter((doc) =>
        filterFn(doc, { checkState: true, checkDistrict: false, checkCity: false, checkHospital: false })
      );
      if (stateMatches.length > 0) {
        const deptName = deptFilter !== 'ALL' ? `${deptFilter} specialists` : 'doctors';
        return {
          filteredDoctors: stateMatches,
          fallbackBanner: `Showing ${deptName} available in ${stateFilter}.`,
        };
      }
    }

    // Tier 4: Nationwide Specialty Fallback
    if (deptFilter !== 'ALL') {
      const deptMatches = doctors.filter((doc) =>
        filterFn(doc, { checkState: false, checkDistrict: false, checkCity: false, checkHospital: false })
      );
      if (deptMatches.length > 0) {
        return {
          filteredDoctors: deptMatches,
          fallbackBanner: `Showing ${deptFilter} specialists available across India.`,
        };
      }
    }

    return { filteredDoctors: [], fallbackBanner: null };
  }, [doctors, search, stateFilter, districtFilter, cityFilter, hospitalFilter, deptFilter, languageFilter]);

  // Calculate Pagination
  const totalDoctors = filteredDoctors.length;
  const totalPages = Math.ceil(totalDoctors / pageSize) || 1;
  const currentPageSafe = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedDoctors = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * pageSize;
    return filteredDoctors.slice(startIndex, startIndex + pageSize);
  }, [filteredDoctors, currentPageSafe, pageSize]);

  // Appointment Slots Effect
  useEffect(() => {
    if (!bookDoctor || !bookDate) return;
    async function fetchSlots() {
      setSlotsLoading(true);
      setBookingError(null);
      try {
        const res = await fetch(
          `/api/schedules/available-slots?doctorId=${bookDoctor.id}&date=${bookDate}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.isWorkingDay && data.availableSlots?.length > 0) {
            setAvailableSlots(data.availableSlots);
            setBookTime(data.availableSlots[0]);
          } else {
            setAvailableSlots([]);
            setBookTime('');
            setBookingError(data.message || 'No available slots on this day.');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, [bookDoctor, bookDate]);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookDoctor || !bookDate || !bookTime) return;

    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: bookDoctor.id,
          date: bookDate,
          timeSlot: bookTime,
          reason: bookReason,
          symptoms: symptomInput,
        }),
      });

      const d = await res.json();

      if (res.ok) {
        setConfirmedApt(d.appointment);
        setBookDoctor(null);
      } else {
        setBookingError(d.error || 'This time slot has just been booked. Please select another available time.');
        // Refresh slots
        const slotsRes = await fetch(
          `/api/schedules/available-slots?doctorId=${bookDoctor.id}&date=${bookDate}`
        );
        if (slotsRes.ok) {
          const data = await slotsRes.json();
          setAvailableSlots(data.availableSlots || []);
          if (data.availableSlots?.length > 0) setBookTime(data.availableSlots[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setBookingError('Network connection error. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-blue-600" /> Find a Doctor
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive India-wide medical directory covering all 28 States & 8 Union Territories.
            </p>
          </div>
          <button
            onClick={fetchDoctorCatalog}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Directory
          </button>
        </div>

        {/* Symptom Matcher Box */}
        <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Need help choosing a specialist?</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Enter your symptoms and we'll suggest a suitable department.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMatchSymptoms()}
              placeholder="e.g. chest pain, severe headache, knee joint pain, fever..."
              className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              onClick={handleMatchSymptoms}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
            >
              Find Specialist
            </button>
          </div>

          {matchedDept && (
            <div className="p-2.5 bg-white border border-blue-300 rounded-xl text-xs flex justify-between items-center text-slate-800">
              <span>
                Suggested Department: <strong className="text-blue-600 font-bold">{matchedDept}</strong>
              </span>
              <button
                onClick={() => {
                  setMatchedDept(null);
                  handleDeptChange('ALL');
                  setSymptomInput('');
                }}
                className="text-[11px] underline hover:text-slate-900 font-semibold"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Filter className="h-4 w-4 text-blue-600" /> Filter Directory
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {totalDoctors} {totalDoctors === 1 ? 'doctor' : 'doctors'} found
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by doctor name, specialty, hospital, city, or language..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Cascading Location & Attribute Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">State / UT</label>
              <select
                value={stateFilter}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All States & UTs</option>
                {allStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">District</label>
              <select
                value={districtFilter}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={stateFilter === 'ALL'}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="ALL">{stateFilter === 'ALL' ? 'Select State First' : 'All Districts'}</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">City</label>
              <select
                value={cityFilter}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={districtFilter === 'ALL'}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="ALL">{districtFilter === 'ALL' ? 'Select District First' : 'All Cities'}</option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hospital</label>
              <select
                value={hospitalFilter}
                onChange={(e) => handleHospitalChange(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Hospitals</option>
                {availableHospitals.map((hosp) => (
                  <option key={hosp} value={hosp}>
                    {hosp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Specialty</label>
              <select
                value={deptFilter}
                onChange={(e) => handleDeptChange(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Specialties</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Language</label>
              <select
                value={languageFilter}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Languages</option>
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(stateFilter !== 'ALL' ||
            districtFilter !== 'ALL' ||
            cityFilter !== 'ALL' ||
            hospitalFilter !== 'ALL' ||
            deptFilter !== 'ALL' ||
            languageFilter !== 'ALL' ||
            search) && (
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500 italic">
                Filtering by:{' '}
                {[
                  stateFilter !== 'ALL' && `State: ${stateFilter}`,
                  districtFilter !== 'ALL' && `District: ${districtFilter}`,
                  cityFilter !== 'ALL' && `City: ${cityFilter}`,
                  hospitalFilter !== 'ALL' && `Hospital: ${hospitalFilter}`,
                  deptFilter !== 'ALL' && `Specialty: ${deptFilter}`,
                  languageFilter !== 'ALL' && `Language: ${languageFilter}`,
                  search && `Search: "${search}"`,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </span>
              <button
                onClick={resetAllFilters}
                className="font-bold text-blue-600 hover:text-blue-800 underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Fallback Info Banner */}
        {fallbackBanner && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
            <span>{fallbackBanner}</span>
          </div>
        )}

        {/* Results Header & Summary */}
        {!loading && (
          <div className="flex justify-between items-center text-xs text-slate-600 font-medium px-1">
            <span>
              Showing {totalDoctors > 0 ? (currentPageSafe - 1) * pageSize + 1 : 0}–
              {Math.min(currentPageSafe * pageSize, totalDoctors)} of {totalDoctors} matching doctors
            </span>
            {totalPages > 1 && (
              <span>
                Page {currentPageSafe} of {totalPages}
              </span>
            )}
          </div>
        )}

        {/* Doctors Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-semibold">Loading doctor directory...</p>
          </div>
        ) : paginatedDoctors.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDoctors.map((doc) => {
                const meta = doc.parsedMeta || parseDoctorBio(doc.bio);
                return (
                  <div
                    key={doc.id}
                    className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-2.5">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {formatDoctorName(doc.user?.name)}
                        </h3>
                        <p className="text-xs text-blue-600 font-semibold mt-0.5">
                          {doc.specialty}
                        </p>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-slate-700">
                        <Building2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span className="font-bold text-slate-900">
                          {meta.hospital}
                        </span>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs text-slate-600">
                        <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>
                          {meta.city}, {meta.district ? `${meta.district}, ` : ''}{meta.state}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Globe className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong className="text-slate-700">Languages:</strong>{' '}
                          {Array.isArray(meta.languages) ? meta.languages.join(', ') : 'English, Hindi'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-slate-700">
                          <span className="text-slate-500 font-semibold flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-slate-500" /> Experience
                          </span>
                          <span className="font-bold text-slate-900">{meta.experience || 10} years</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-700 border-t border-slate-200 pt-1.5">
                          <span className="text-slate-500 font-semibold">Consultation Fee</span>
                          <span className="font-mono font-extrabold text-emerald-700 text-sm">
                            {formatINR(doc.consultationFee)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <Link
                        href={`/patient/doctors/${doc.id}`}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl text-center transition-colors"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => setBookDoctor(doc)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clean Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-2-[0_1px_2px_rgba(0,0,0,0.04)]">
                <span className="text-xs text-slate-600 font-semibold">
                  Showing page {currentPageSafe} of {totalPages}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPageSafe === 1}
                    className="p-2 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPageSafe) <= 2)
                      .reduce((acc: (number | string)[], p, idx, arr) => {
                        if (idx > 0 && typeof arr[idx - 1] === 'number' && p - (arr[idx - 1] as number) > 1) {
                          acc.push('...');
                        }
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, index) =>
                        item === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-2 text-xs text-slate-400 font-bold">
                            ...
                          </span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setCurrentPage(item as number)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                              currentPageSafe === item
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPageSafe === totalPages}
                    className="p-2 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs space-y-2">
            <p className="font-bold text-slate-800 text-sm">No matching doctors found</p>
            <p>Try clearing or adjusting location, hospital, specialty, or language filters.</p>
            <button
              onClick={resetAllFilters}
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs mt-3 transition-all shadow-xs"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Clean Book Appointment Modal */}
        {bookDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Book Appointment: {formatDoctorName(bookDoctor.user?.name)}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {bookDoctor.specialty} • Fee:{' '}
                    <span className="text-emerald-700 font-bold font-mono text-sm">
                      {formatINR(bookDoctor.consultationFee)}
                    </span>
                  </p>
                </div>
                <button onClick={() => setBookDoctor(null)} className="text-slate-400 hover:text-slate-700 text-base">
                  ✕
                </button>
              </div>

              {bookingError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center justify-between">
                  <span>{bookingError}</span>
                  <button type="button" onClick={() => setBookingError(null)} className="text-amber-700 hover:text-amber-900 font-bold ml-2">✕</button>
                </div>
              )}

              <form onSubmit={handleConfirmBooking} className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Date</label>
                  <input
                    type="date"
                    required
                    value={bookDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Available Time Slot</label>
                  {slotsLoading ? (
                    <p className="text-slate-500">Fetching available schedule slots...</p>
                  ) : availableSlots.length > 0 ? (
                    <select
                      value={bookTime}
                      onChange={(e) => setBookTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                    >
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-rose-700 font-semibold p-2 bg-rose-50 border border-rose-200 rounded-lg">
                      No available slots on this day.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reason for Visit</label>
                  <input
                    type="text"
                    required
                    value={bookReason}
                    onChange={(e) => setBookReason(e.target.value)}
                    placeholder="Enter reason for visit"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBookDoctor(null)}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading || !bookTime || availableSlots.length === 0}
                    className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xs disabled:opacity-50"
                  >
                    {bookingLoading ? 'Processing...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmedApt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs text-center">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Appointment Confirmed!</h3>
              <p className="text-slate-600 font-mono">Appointment ID: #{confirmedApt.appointmentNo}</p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setConfirmedApt(null)}
                  className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-300"
                >
                  Close
                </button>
                <Link
                  href={`/patient/appointments/${confirmedApt.id}`}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
