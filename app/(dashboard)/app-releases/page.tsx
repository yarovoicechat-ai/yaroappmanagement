'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Upload,
  CheckCircle2,
  FileCode,
  AlertCircle,
  Trash2,
  RefreshCw,
  HardDrive,
  FileCheck,
  Tag,
  ArrowDownToLine,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { apiClient } from '@/lib/apiClient';

interface AppRelease {
  _id: string;
  versionName: string;
  versionCode?: number;
  fileUrl: string;
  fileType: 'apk' | 'aab';
  originalFileName: string;
  fileSizeFormatted: string;
  releaseNotes?: string;
  isActive: boolean;
  downloadCount: number;
  uploadedBy?: string;
  createdAt: string;
}

export default function AppReleasesPage() {
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [directUrl, setDirectUrl] = useState('');
  const [uploadTab, setUploadTab] = useState<'file' | 'url'>('file');
  const [versionName, setVersionName] = useState('1.8.3');
  const [versionCode, setVersionCode] = useState('22');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [setAsActive, setSetAsActive] = useState(true);

  // UI Toast Status
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.APP_RELEASES.ALL);
      if (res && res.success) {
        if (Array.isArray(res.data)) {
          setReleases(res.data);
        } else if (res.data && Array.isArray(res.data.data)) {
          setReleases(res.data.data);
        } else {
          setReleases([]);
        }
      } else {
        setReleases([]);
      }
    } catch (err: any) {
      console.error('Error fetching releases:', err);
      setReleases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const safeReleases = Array.isArray(releases) ? releases : [];
  const activeRelease = safeReleases.find((r) => r && r.isActive) || safeReleases[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'apk' && ext !== 'aab') {
        setStatusMsg({ type: 'error', text: 'Please select an .apk or .aab build file.' });
        return;
      }
      setSelectedFile(file);
      setStatusMsg(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadTab === 'file' && !selectedFile) {
      setStatusMsg({ type: 'error', text: 'Select an APK or AAB build file to upload.' });
      return;
    }
    if (uploadTab === 'url' && !directUrl.trim()) {
      setStatusMsg({ type: 'error', text: 'Enter a valid direct download URL (e.g. AWS S3, Cloudinary, CDN link).' });
      return;
    }
    if (!versionName.trim()) {
      setStatusMsg({ type: 'error', text: 'Version name (e.g. 1.8.3) is required.' });
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setStatusMsg(null);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('buildFile', selectedFile);
      }
      if (directUrl.trim()) {
        formData.append('directUrl', directUrl.trim());
      }
      formData.append('versionName', versionName.trim());
      formData.append('versionCode', versionCode);
      formData.append('releaseNotes', releaseNotes);
      formData.append('setAsActive', String(setAsActive));

      const res = await apiClient.uploadFile<AppRelease>(
        API_ENDPOINTS.APP_RELEASES.UPLOAD,
        formData,
        (percent) => setUploadProgress(percent)
      );

      setUploadProgress(100);

      if (res && res.success) {
        setStatusMsg({ type: 'success', text: `Build v${versionName} deployed successfully!` });
        setSelectedFile(null);
        setDirectUrl('');
        setReleaseNotes('');
        await fetchReleases();
      } else {
        setStatusMsg({ type: 'error', text: res?.message || 'Failed to deploy build.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error deploying build file.' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSetActive = async (id: string, version: string) => {
    try {
      const res = await apiClient.patch(API_ENDPOINTS.APP_RELEASES.ACTIVATE(id), {});
      if (res && res.success) {
        setStatusMsg({ type: 'success', text: `v${version} is now set as the live website download build!` });
        await fetchReleases();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to set active release.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this build release?')) return;
    try {
      const res = await apiClient.delete(API_ENDPOINTS.APP_RELEASES.DELETE(id));
      if (res && res.success) {
        setStatusMsg({ type: 'success', text: 'Build deleted successfully.' });
        await fetchReleases();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete build.' });
    }
  };

  const getDirectDownloadUrl = () => {
    return 'https://api.mithichat.live/api/v1/app-releases/download';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Download className="w-7 h-7 text-indigo-400" />
            App Release & Build Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload APK or AAB builds here. Uploaded files will automatically serve as the active download on the website (<code className="text-indigo-300">mithichat.live</code>).
          </p>
        </div>
        <button
          onClick={fetchReleases}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-slate-700 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Builds
        </button>
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

      {/* Grid: Active Build Status + Upload Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Live Build Status Card */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/30 p-6 rounded-2xl border border-indigo-500/30 space-y-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Live Website Download Build</span>
            </div>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold">
              {activeRelease?.fileType ? activeRelease.fileType.toUpperCase() : 'APK'} Build
            </span>
          </div>

          {activeRelease ? (
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-extrabold text-white flex items-center gap-3">
                  v{activeRelease.versionName || '1.7.6'}
                  <span className="text-sm font-normal text-slate-400">({activeRelease.fileSizeFormatted || '64 MB'})</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5" /> {activeRelease.originalFileName || 'app-release.apk'}
                </div>
              </div>

              {activeRelease.releaseNotes && (
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-1">Release Notes:</span>
                  {activeRelease.releaseNotes}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Total Downloads</span>
                  <span className="text-lg font-bold text-indigo-400">{activeRelease.downloadCount || 0}</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Last Updated</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {activeRelease.createdAt ? new Date(activeRelease.createdAt).toLocaleDateString() : 'Today'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href={getDirectDownloadUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition text-sm shadow-lg shadow-indigo-600/20"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Test Live Download
                </a>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              No custom build uploaded yet. Default system build active.
            </div>
          )}
        </div>

        {/* Upload Build Form Card */}
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              Upload & Deploy New Build
            </h2>

            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setUploadTab('file')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  uploadTab === 'file' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                File Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('url')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  uploadTab === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Direct URL
              </button>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            {uploadTab === 'file' ? (
              /* File Dropzone */
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-5 text-center transition cursor-pointer bg-slate-950/40 relative">
                <input
                  type="file"
                  accept=".apk,.aab"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center gap-2">
                  {selectedFile ? (
                    <>
                      <FileCheck className="w-10 h-10 text-emerald-400" />
                      <span className="text-sm font-medium text-slate-200">{selectedFile.name}</span>
                      <span className="text-xs text-slate-400">({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-10 h-10 text-indigo-400/80" />
                      <span className="text-sm font-medium text-slate-200">Click or drag & drop APK or AAB build here</span>
                      <span className="text-xs text-slate-400">Supports .apk and .aab up to 250MB</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Direct URL Input */
              <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-semibold text-slate-300">Direct Download Link / CDN URL</label>
                <input
                  type="url"
                  placeholder="https://cdn.mithichat.live/builds/app-release.apk"
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-xs text-slate-400">
                  Enter a direct HTTPS link to your build. Bypasses file size limits!
                </p>
              </div>
            )}

            {/* Version Input Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Version Name *</label>
                <input
                  type="text"
                  placeholder="e.g. 1.7.6"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Version Code</label>
                <input
                  type="number"
                  placeholder="e.g. 176"
                  value={versionCode}
                  onChange={(e) => setVersionCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Release Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Release Notes / Changelog</label>
              <textarea
                rows={2}
                placeholder="What's new in this build..."
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Set Active Checkbox */}
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={setAsActive}
                onChange={(e) => setSetAsActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
              />
              Set as active website download build immediately upon upload
            </label>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Uploading Build...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading Build...' : 'Upload & Deploy Build'}
            </button>
          </form>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-400" />
          Uploaded Build History
        </h2>

        {safeReleases.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">No uploaded builds found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400">
                <tr>
                  <th className="p-3">Version</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">File Size</th>
                  <th className="p-3">Downloads</th>
                  <th className="p-3">Upload Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {safeReleases.map((rel) => (
                  <tr key={rel._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-white">v{rel.versionName || '1.0.0'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 font-mono text-indigo-300">
                        {rel.fileType ? rel.fileType.toUpperCase() : 'APK'}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-400">{rel.fileSizeFormatted || '0 MB'}</td>
                    <td className="p-3 font-medium text-slate-200">{rel.downloadCount || 0}</td>
                    <td className="p-3 text-xs text-slate-400">
                      {rel.createdAt ? new Date(rel.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3">
                      {rel.isActive ? (
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
                          Active Live
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full text-xs">Inactive</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {!rel.isActive && (
                        <button
                          onClick={() => handleSetActive(rel._id, rel.versionName)}
                          className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-500/30 transition"
                        >
                          Make Active
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(rel._id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                        title="Delete Build"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
