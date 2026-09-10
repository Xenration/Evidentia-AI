// src/pages/global/Cases.tsx (Updated with Case Type, Date/Time, Location)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FolderOpen, Calendar, User, X, MapPin, Clock, Tag } from 'lucide-react';
import { caseService } from '../../services';
import { Case } from '../../types';

const CASE_TYPES = [
  'Murder', 'Theft', 'Missing Person', 'Fraud', 
  'Accident', 'Cyber Crime', 'Domestic Violence', 'Other'
];

const CASE_STATUSES = [
  'Active', 'Under Investigation', 'Pending', 'Closed'
];

export function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New Case Form State
  const [newCase, setNewCase] = useState({
    title: '',
    caseType: '',
    description: '',
    incidentDate: '',
    incidentTime: '',
    location: '',
    victim: '',
    keyDetails: '',
    status: 'Active'
  });

  const [unknownDate, setUnknownDate] = useState(false);
  const [unknownLocation, setUnknownLocation] = useState(false);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const data = await caseService.getCases();
      setCases(data);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
      const mockData = await import('../../mock-data').then(m => m.mockCases);
      setCases(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCreateCase = async () => {
    if (!newCase.title.trim()) {
      alert('Please enter a case title.');
      return;
    }

    if (!newCase.caseType) {
      alert('Please select a case type.');
      return;
    }

    setCreating(true);
    try {
      // Build incident date/time string
      let incidentDateTime = '';
      if (!unknownDate && newCase.incidentDate) {
        incidentDateTime = newCase.incidentDate;
        if (newCase.incidentTime) {
          incidentDateTime += ` ${newCase.incidentTime}`;
        }
      } else if (unknownDate) {
        incidentDateTime = 'Unknown';
      }

      const caseData = {
        title: newCase.title,
        case_type: newCase.caseType,
        description: newCase.description,
        incident_date: incidentDateTime,
        location: unknownLocation ? 'Unknown' : newCase.location,
        victim: newCase.victim,
        key_details: newCase.keyDetails,
        status: newCase.status,
        created_by: 'current_user'
      };

      const created = await caseService.createCase(caseData);
      setShowCreateModal(false);
      // Reset form
      setNewCase({
        title: '',
        caseType: '',
        description: '',
        incidentDate: '',
        incidentTime: '',
        location: '',
        victim: '',
        keyDetails: '',
        status: 'Active'
      });
      setUnknownDate(false);
      setUnknownLocation(false);
      setCases(prev => [...prev, created]);
      alert('Case created successfully!');
    } catch (error) {
      console.error('Failed to create case:', error);
      alert('Failed to create case. Make sure the backend is running.');
    } finally {
      setCreating(false);
    }
  };

  // Get case type badge color
  const getCaseTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Murder': 'bg-red-500/20 text-red-400',
      'Theft': 'bg-yellow-500/20 text-yellow-400',
      'Missing Person': 'bg-orange-500/20 text-orange-400',
      'Fraud': 'bg-purple-500/20 text-purple-400',
      'Accident': 'bg-blue-500/20 text-blue-400',
      'Cyber Crime': 'bg-cyan-500/20 text-cyan-400',
      'Domestic Violence': 'bg-pink-500/20 text-pink-400',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  const filteredCases = cases.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.case_type && c.case_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cases</h1>
          <p className="text-text-muted text-sm">Manage all investigation cases</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> New Case
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search cases by title, type, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#111d2d] border border-[#294057] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && cases.length === 0 && (
        <div className="text-center py-12 border border-dashed border-[#294057] rounded-lg">
          <FolderOpen className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No cases yet. Create your first case!</p>
        </div>
      )}

      {/* Case Grid */}
      {!loading && cases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((caseItem) => (
            <Link
              key={caseItem.id}
              to={`/cases/${caseItem.id}/overview`}
              className="group block bg-[#111d2d] border border-[#294057] hover:border-cyan-500/30 rounded-lg p-5 transition-all hover:shadow-lg hover:shadow-cyan-500/5"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg group-hover:text-cyan-400 transition-colors">
                  {caseItem.title}
                </h3>
              </div>
              
              {/* Case Type Badge */}
              {caseItem.case_type && (
                <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium mb-2 ${getCaseTypeColor(caseItem.case_type)}`}>
                  {caseItem.case_type}
                </span>
              )}

              {/* Status Badge */}
              <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ml-2 ${
                caseItem.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                caseItem.status === 'Under Investigation' ? 'bg-yellow-500/20 text-yellow-400' :
                caseItem.status === 'Closed' ? 'bg-gray-500/20 text-gray-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {caseItem.status || 'Active'}
              </span>

              {caseItem.description && (
                <p className="text-text-muted text-sm line-clamp-2 mt-2 mb-3">
                  {caseItem.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {caseItem.incident_date || caseItem.created_at ? 
                    new Date(caseItem.incident_date || caseItem.created_at).toLocaleDateString() : 
                    'Unknown Date'}
                </span>
                {caseItem.location && caseItem.location !== 'Unknown' && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {caseItem.location}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
          <div className="bg-[#111d2d] border border-[#294057] rounded-xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#111d2d] z-10 pb-4 border-b border-[#294057]">
              <h2 className="text-xl font-bold">Create New Case</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Case Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Case Title *</label>
                <input
                  type="text"
                  value={newCase.title}
                  onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                  placeholder="Enter case title..."
                  className="w-full px-3 py-2 bg-[#09111d] border border-[#294057] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              {/* Case Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Case Type *</label>
                <select
                  value={newCase.caseType}
                  onChange={(e) => setNewCase({...newCase, caseType: e.target.value})}
                  className="w-full px-3 py-2 bg-[#09111d] border border-[#294057] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="">Select case type...</option>
                  {CASE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Incident Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Incident Date</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={newCase.incidentDate}
                      onChange={(e) => setNewCase({...newCase, incidentDate: e.target.value})}
                      disabled={unknownDate}
                      className="flex-1 px-3 py-2 bg-[#09111d] border border-[#294057] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50"
                    />
                    <label className="flex items-center gap-1 text-sm text-text-muted whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={unknownDate}
                        onChange={(e) => setUnknownDate(e.target.checked)}
                        className="accent-cyan-500"
                      />
                      Unknown
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Incident Time</label>
                  <input
                    type="time"
                    value={newCase.incidentTime}
                    onChange={(e) => setNewCase({...newCase, incidentTime: e.target.value})}
                    disabled={unknownDate}
                    className="w-full px-3 py-2 bg-[#09111d] border border-[#294057] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCase.location}
                    onChange={(e) => setNewCase({...newCase, location: e.target.value})}
                    disabled={unknownLocation}
                    placeholder="Enter location..."
                    className="flex-1 px-3 py-2 bg-[#09111d] border border-[#294057] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50"
                  />
                  <label className="flex items-center gap-1 text-sm text-text-muted whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={unknownLocation}
                      onChange={(e) => setUnknownLocation(e.target.checked)}
                      className="accent-cyan-500"
                    />
                    Unknown
                  </label>
                </div>
              </div>

              {/* Victim/Subject */}
              <div>
                <label className="block text-sm font-medium mb-1">Victim / Subject</label>
                <input
                  type="text"
                  value={newCase.victim}
                  onChange={(e) => setNewCase({...newCase, victim: e.target.value})}
                  placeholder="Enter victim name or subject..."
                  className="w-full px-3 py-2 bg-[#09111d] border border-[#294057] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newCase.description}
                  onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                  placeholder="Describe the case in detail..."
                  rows={4}
                  className="w-full px-3 py-2 bg-[#09111d] border border-[#294057] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
              </div>

              {/* Key Details */}
              <div>
                <label className="block text-sm font-medium mb-1">Key Details</label>
                <textarea
                  value={newCase.keyDetails}
                  onChange={(e) => setNewCase({...newCase, keyDetails: e.target.value})}
                  placeholder="Enter key facts, bullet points, or important details..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#09111d] border border-[#294057] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={newCase.status}
                  onChange={(e) => setNewCase({...newCase, status: e.target.value})}
                  className="w-full px-3 py-2 bg-[#09111d] border border-[#294057] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  {CASE_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-[#294057] sticky bottom-0 bg-[#111d2d] pb-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-[#294057] hover:bg-[#294057]/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCase}
                  disabled={creating || !newCase.title.trim() || !newCase.caseType}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Case'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}