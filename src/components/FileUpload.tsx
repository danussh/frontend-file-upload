import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadPDF } from '../services/api';
import type { UploadResponse } from '../services/api';

interface FileUploadProps {
  onUploadSuccess?: (data: UploadResponse) => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Please upload a PDF file';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const error = validateFile(droppedFile);
      if (error) {
        toast.error(error);
        setUploadStatus('error');
        setMessage(error);
        return;
      }
      setFile(droppedFile);
      setUploadStatus('idle');
      setMessage('');
      toast.success(`${droppedFile.name} ready to upload`);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const error = validateFile(selectedFile);
      if (error) {
        toast.error(error);
        setUploadStatus('error');
        setMessage(error);
        return;
      }
      setFile(selectedFile);
      setUploadStatus('idle');
      setMessage('');
      toast.success(`${selectedFile.name} ready to upload`);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus('idle');
    setMessage('');

    try {
      const response = await uploadPDF(file);
      setUploadStatus('success');
      setMessage(response.message);
      setUploadData(response);
      toast.success(`✅ ${response.message}`, {
        autoClose: 4000,
      });
      onUploadSuccess?.(response);
    } catch (error: any) {
      setUploadStatus('error');
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      setMessage(errorMessage);
      toast.error(`❌ ${errorMessage}`, {
        autoClose: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadStatus('idle');
    setMessage('');
    setUploadData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      <div className="bg-white rounded-3xl shadow-xl p-12 border border-slate-200 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-50 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10">

        {!file ? (
          <div
            className={`
              relative border-3 border-dashed rounded-3xl p-16 transition-all duration-300
              ${isDragging 
                ? 'border-pink-400 bg-pink-50 scale-[1.01]' 
                : 'border-slate-300 hover:border-pink-300 bg-slate-50/50'
              }
            `}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <div className="relative w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-pink-500/20 transform hover:scale-105 hover:rotate-3 transition-all duration-300">
                <Upload className="w-12 h-12 text-white" />
              </div>
              <p className="text-xl font-semibold text-slate-900 mb-2">
                Drag and drop to upload the PDF file or
              </p>
              <div className="mt-6 text-sm text-slate-500 space-y-1">
                <p>• You can upload PDF files</p>
                <p>• Maximum file size is 10MB</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-pink-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-slate-900 truncate">
                  {file.name}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                disabled={uploading}
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="group relative w-full py-4 px-8 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3 overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              
              {/* Content */}
              <div className="relative flex items-center gap-3">
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-lg">Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6" />
                    <span className="text-lg tracking-wide">Upload & Extract</span>
                  </>
                )}
              </div>
            </button>
          </div>
        )}

        {message && (
          <div
            className={`
              mt-6 p-5 rounded-2xl flex items-start gap-3 border-2
              ${uploadStatus === 'success' 
                ? 'bg-green-50 border-green-300' 
                : 'bg-red-100 border-red-400'
              }
            `}
          >
            {uploadStatus === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-700 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-700 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-base font-semibold ${
                uploadStatus === 'success' 
                  ? 'text-green-900' 
                  : 'text-red-900'
              }`}>
                {message}
              </p>
              {uploadData && uploadStatus === 'success' && (
                <div className="mt-2 text-sm text-green-800">
                  <p>Extracted {uploadData.data.rowCount} rows with {uploadData.data.headers.length} columns</p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
