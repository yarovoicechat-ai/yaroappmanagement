'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Camera,
  Video,
  Code2,
  Edit3,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Eye,
  X,
  Save,
  Lock,
  Unlock,
  FileCode,
  Layers,
  Trash2,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { apiClient } from '@/lib/apiClient';

interface AppScreen {
  _id: string;
  screenCode: string;
  screenName: string;
  screenCategory: string;
  description: string;
  allowScreenshot: boolean;
  allowScreenRecording: boolean;
  flagSecureEnabled: boolean;
  codeSnippet: string;
  filePath?: string;
  isActive: boolean;
  updatedAt: string;
}

export default function ScreenSecurityPage() {
  const [screens, setScreens] = useState<AppScreen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal States
  const [editingScreen, setEditingScreen] = useState<AppScreen | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for Editing/Adding
  const [formState, setFormState] = useState({
    screenCode: '',
    screenName: '',
    screenCategory: 'General',
    description: '',
    filePath: '',
    codeSnippet: '',
    allowScreenshot: false,
    allowScreenRecording: false,
    flagSecureEnabled: true,
  });

  // UI Toast Status
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchScreens = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.APP_SCREENS.ALL);
      if (res && res.success) {
        if (Array.isArray(res.data)) {
          setScreens(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setScreens(res.data.data);
        } else {
          setScreens([]);
        }
      } else {
        setScreens([]);
      }
    } catch (err: any) {
      console.error('Error fetching screens:', err);
      setScreens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, []);

  const safeScreens = Array.isArray(screens) ? screens : [];

  // Toggle Handlers
  const handleToggleScreenshot = async (screen: AppScreen) => {
    try {
      const res = await apiClient.patch(API_ENDPOINTS.APP_SCREENS.TOGGLE_SCREENSHOT(screen._id), {});
      if (res && res.success) {
        setStatusMsg({
          type: 'success',
          text: `Screenshot protection on '${screen.screenName}' updated.`,
        });
        await fetchScreens();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to toggle screenshot protection.' });
    }
  };

  const handleToggleRecording = async (screen: AppScreen) => {
    try {
      const res = await apiClient.patch(API_ENDPOINTS.APP_SCREENS.TOGGLE_RECORDING(screen._id), {});
      if (res && res.success) {
        setStatusMsg({
          type: 'success',
          text: `Screen recording protection on '${screen.screenName}' updated.`,
        });
        await fetchScreens();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to toggle screen recording protection.' });
    }
  };

  const handleOpenEdit = (screen: AppScreen) => {
    setEditingScreen(screen);
    setFormState({
      screenCode: screen.screenCode,
      screenName: screen.screenName,
      screenCategory: screen.screenCategory || 'General',
      description: screen.description || '',
      filePath: screen.filePath || '',
      codeSnippet: screen.codeSnippet || '// React Native Component Source Code',
      allowScreenshot: screen.allowScreenshot,
      allowScreenRecording: screen.allowScreenRecording,
      flagSecureEnabled: screen.flagSecureEnabled,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScreen) return;
    try {
      const res = await apiClient.put(API_ENDPOINTS.APP_SCREENS.UPDATE(editingScreen._id), formState);
      if (res && res.success) {
        setStatusMsg({ type: 'success', text: `Screen '${formState.screenName}' code & security updated.` });
        setEditingScreen(null);
        await fetchScreens();
      } else {
        setStatusMsg({ type: 'error', text: res?.message || 'Failed to save screen code.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error updating screen code.' });
    }
  };

  const handleCreateScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.screenCode || !formState.screenName) {
      setStatusMsg({ type: 'error', text: 'Screen code and name are required.' });
      return;
    }
    try {
      const res = await apiClient.post(API_ENDPOINTS.APP_SCREENS.CREATE, formState);
      if (res && res.success) {
        setStatusMsg({ type: 'success', text: `New Screen '${formState.screenName}' added to directory.` });
        setShowAddModal(false);
        await fetchScreens();
      } else {
        setStatusMsg({ type: 'error', text: res?.message || 'Failed to create screen.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error creating screen entry.' });
    }
  };

  const handleDeleteScreen = async (id: string) => {
    if (!confirm('Are you sure you want to delete this screen entry?')) return;
    try {
      const res = await apiClient.delete(API_ENDPOINTS.APP_SCREENS.DELETE(id));
      if (res && res.success) {
        setStatusMsg({ type: 'success', text: 'Screen removed from directory.' });
        await fetchScreens();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete screen.' });
    }
  };

  // Filtered screens calculation
  const categories = ['ALL', ...Array.from(new Set(safeScreens.map((s) => s.screenCategory || 'General')))];

  const filteredScreens = safeScreens.filter((s) => {
    const matchesCategory = selectedCategory === 'ALL' || s.screenCategory === selectedCategory;
    const matchesSearch =
      s.screenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.screenCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.filePath && s.filePath.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // KPI stats
  const totalScreens = safeScreens.length;
  const screenshotProtected = safeScreens.filter((s) => !s.allowScreenshot).length;
  const recordingProtected = safeScreens.filter((s) => !s.allowScreenRecording).length;
  const flagSecureActive = safeScreens.filter((s) => s.flagSecureEnabled).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
            App Screen Directory & Security Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            View & edit app screen source code definitions, and remotely enable or disable screenshot & screen recording protection across mobile app screens.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormState({
                screenCode: '',
                screenName: '',
                screenCategory: 'General',
                description: '',
                filePath: 'src/screens/',
                codeSnippet: '// React Native Component Source Code\nexport default function Component() {\n  return null;\n}',
                allowScreenshot: false,
                allowScreenRecording: false,
                flagSecureEnabled: true,
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition text-sm shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add New Screen Code
          </button>
          <button
            onClick={fetchScreens}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {statusMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
              : 'bg-rose-950/50 text-rose-300 border-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-medium">{statusMsg.text}</span>
        </motion.div>
      )}

      {/* Security Summary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total App Screens</span>
            <span className="text-2xl font-extrabold text-white">{totalScreens}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Screenshot Protected</span>
            <span className="text-2xl font-extrabold text-emerald-400">{screenshotProtected}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Recording Protected</span>
            <span className="text-2xl font-extrabold text-purple-400">{recordingProtected}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">FLAG_SECURE Active</span>
            <span className="text-2xl font-extrabold text-blue-400">{flagSecureActive}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search screen code, name or file path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Screens Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScreens.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-slate-900/40 rounded-2xl border border-slate-800">
            No screen entries match your search criteria.
          </div>
        ) : (
          filteredScreens.map((screen) => (
            <div
              key={screen._id}
              className="bg-slate-900/60 hover:bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base">{screen.screenName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {screen.screenCode}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {screen.filePath ? screen.filePath : 'src/screens'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-700">
                    {screen.screenCategory}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{screen.description || 'App Screen Component'}</p>
              </div>

              {/* Security Protection Toggles */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remote Security Toggles</div>

                {/* Screenshot Toggle */}
                <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2.5 text-xs text-slate-200">
                    <Camera className={`w-4 h-4 ${!screen.allowScreenshot ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>Screenshot Protection</span>
                  </div>
                  <button
                    onClick={() => handleToggleScreenshot(screen)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      !screen.allowScreenshot
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {!screen.allowScreenshot ? 'BLOCKED 🛡️' : 'ALLOWED'}
                  </button>
                </div>

                {/* Recording Toggle */}
                <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2.5 text-xs text-slate-200">
                    <Video className={`w-4 h-4 ${!screen.allowScreenRecording ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span>Screen Recording Protection</span>
                  </div>
                  <button
                    onClick={() => handleToggleRecording(screen)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      !screen.allowScreenRecording
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {!screen.allowScreenRecording ? 'BLOCKED 🎥' : 'ALLOWED'}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleOpenEdit(screen)}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  View & Edit Code
                </button>
                <button
                  onClick={() => handleDeleteScreen(screen._id)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition border border-rose-500/20"
                  title="Remove Screen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Code & Security Modal */}
      <AnimatePresence>
        {editingScreen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-3xl space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <FileCode className="w-6 h-6 text-indigo-400" />
                  <div>
                    <h2 className="text-lg font-bold text-white">Edit Screen Code & Security Settings</h2>
                    <span className="text-xs text-slate-400 font-mono">{editingScreen.screenCode}</span>
                  </div>
                </div>
                <button onClick={() => setEditingScreen(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Screen Name *</label>
                    <input
                      type="text"
                      value={formState.screenName}
                      onChange={(e) => setFormState({ ...formState, screenName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={formState.screenCategory}
                      onChange={(e) => setFormState({ ...formState, screenCategory: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">File Path in React Native App</label>
                  <input
                    type="text"
                    value={formState.filePath}
                    onChange={(e) => setFormState({ ...formState, filePath: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Screen Description</label>
                  <input
                    type="text"
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Source Code Snippet Editor */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Component Source Code Snippet</label>
                    <span className="text-[10px] text-slate-500 font-mono">React Native Component Config</span>
                  </div>
                  <textarea
                    rows={8}
                    value={formState.codeSnippet}
                    onChange={(e) => setFormState({ ...formState, codeSnippet: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Remote Security Flags Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.allowScreenshot}
                      onChange={(e) => setFormState({ ...formState, allowScreenshot: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-700 text-indigo-600 bg-slate-950"
                    />
                    Allow Screenshots on this Screen
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.allowScreenRecording}
                      onChange={(e) => setFormState({ ...formState, allowScreenRecording: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-700 text-indigo-600 bg-slate-950"
                    />
                    Allow Screen Recording on this Screen
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingScreen(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-600/20"
                  >
                    <Save className="w-4 h-4" />
                    Save Code & Security Config
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Screen Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <Plus className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">Add New Screen Entry</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateScreen} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Screen Code (Unique) *</label>
                    <input
                      type="text"
                      placeholder="e.g. HostAgency"
                      value={formState.screenCode}
                      onChange={(e) => setFormState({ ...formState, screenCode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Screen Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Host Agency Portal"
                      value={formState.screenName}
                      onChange={(e) => setFormState({ ...formState, screenName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Finance, Calls, General"
                      value={formState.screenCategory}
                      onChange={(e) => setFormState({ ...formState, screenCategory: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">File Path</label>
                    <input
                      type="text"
                      placeholder="e.g. src/screens/app/HostAgency.js"
                      value={formState.filePath}
                      onChange={(e) => setFormState({ ...formState, filePath: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Screen component usage description..."
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Source Code Snippet */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Source Code Snippet</label>
                  <textarea
                    rows={6}
                    value={formState.codeSnippet}
                    onChange={(e) => setFormState({ ...formState, codeSnippet: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    Create Screen Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
