import React, { useState, useRef } from 'react'
import { previewBulkImport, confirmBulkImport } from '@/services/adminApi'

const BulkImportModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null)
  const [images, setImages] = useState([])
  const [previewData, setPreviewData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const imagesInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setError('')
    }
  }

  const handleImagesChange = (e) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  const handlePreview = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      images.forEach(img => formData.append('images', img))
      const res = await previewBulkImport(formData)
      if (res.success) {
        setPreviewData(res.preview)
      } else {
        setError(res.message || 'Failed to generate preview')
      }
    } catch (err) {
      setError(err.message || 'Error parsing file')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!previewData || !previewData.valid.length) return
    if (previewData.errors.length > 0) return // Block if hard errors

    setLoading(true)
    try {
      const res = await confirmBulkImport(previewData.valid)
      if (res.success) {
        onSuccess(res.message)
        onClose()
      } else {
        setError(res.message || 'Failed to import products')
      }
    } catch (err) {
      setError(err.message || 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('nh-salem-admin-token') : null
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const res = await fetch(`${API_URL}/api/admin/products/bulk-import/template`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to download template')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bulk_import_template.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Could not download template')
    }
  }

  const hasHardErrors = previewData?.errors?.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-xl font-bold text-slate-900">Bulk Import Products</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
            </div>
          )}

          {!previewData ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-4">
                <span className="material-symbols-outlined text-blue-500 mt-0.5">info</span>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">How it works:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Download the template to see the required format.</li>
                    <li>Rows with the same <strong>Product Name</strong> will be grouped into a single product with multiple weight variants.</li>
                    <li>Online Price should not exceed MRP.</li>
                    <li>Only the first row of a product needs the Thumbnail URL.</li>
                  </ul>
                  <button 
                    onClick={handleDownloadTemplate}
                    className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download Template
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-white text-center">
                  <input
                    type="file"
                    accept=".xlsx"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-2xl text-slate-400">upload_file</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">
                      {file ? file.name : "1. Upload Excel File"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : "Select .xlsx file"}
                    </p>
                  </label>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-white text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={imagesInputRef}
                    onChange={handleImagesChange}
                    className="hidden"
                    id="images-upload"
                  />
                  <label htmlFor="images-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-2xl text-slate-400">imagesmode</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">
                      {images.length > 0 ? `${images.length} Images Selected` : "2. Upload Images (Optional)"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {images.length > 0 ? "Click to change" : "Select associated images"}
                    </p>
                  </label>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={handlePreview}
                  disabled={!file || loading}
                  className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Preview Import'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Errors Block */}
              {hasHardErrors && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="text-red-800 font-bold flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined">error</span>
                    Cannot proceed: Fix {previewData.errors.length} errors
                  </h3>
                  <ul className="list-disc pl-6 text-sm text-red-700 space-y-1">
                    {previewData.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => setPreviewData(null)}
                    className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
                  >
                    Upload Fixed File
                  </button>
                </div>
              )}

              {/* Preview Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-900">
                    Parsed Products ({previewData.valid.length})
                  </h3>
                  {!hasHardErrors && (
                    <button onClick={() => setPreviewData(null)} className="text-sm text-slate-500 hover:text-slate-700">
                      Upload different file
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3 font-medium">Product Name</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Variants</th>
                        <th className="px-4 py-3 font-medium">Thumbnail</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewData.valid.map((prod, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 align-top font-medium text-slate-900">{prod.name}</td>
                          <td className="px-4 py-3 align-top text-slate-600">{prod.category}</td>
                          <td className="px-4 py-3 align-top">
                            <div className="space-y-1">
                              {prod.weights.map((w, wi) => (
                                <div key={wi} className="text-xs flex gap-2">
                                  <span className="font-medium bg-slate-100 px-1.5 rounded">{w.label}</span>
                                  <span className="text-slate-500 line-through">₹{w.originalPrice}</span>
                                  <span className="text-slate-900">₹{w.price}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top text-slate-500 max-w-[150px] truncate">
                            {prod.image || '-'}
                          </td>
                          <td className="px-4 py-3 align-top">
                            {prod.rowWarnings?.length > 0 ? (
                              <div className="text-amber-600 flex flex-col gap-1">
                                {prod.rowWarnings.map((w, wi) => (
                                  <span key={wi} className="flex items-center gap-1 text-xs">
                                    <span className="material-symbols-outlined text-[14px]">warning</span>
                                    {w}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          {previewData && !hasHardErrors && (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-6 py-2 bg-slate-900 text-white font-medium hover:bg-slate-800 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Importing...' : `Confirm & Import ${previewData.valid.length} Products`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BulkImportModal
