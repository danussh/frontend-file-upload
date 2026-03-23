import { useState } from 'react';
import FileUpload from './components/FileUpload';
import DataListing from './components/DataListing';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'data'>('upload');

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      setActiveTab('data');
    }, 2000);
  };

  return (
    <div className="min-h-screen py-8 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-slate-900 mb-3 tracking-tight">
            Upload PDF File
          </h1>
          <p className="text-lg text-slate-600 font-light">
            Please upload the PDF file to extract tabular data
          </p>
        </header>

        <div className="mb-8">
          <div className="inline-flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 mx-auto">
            <button
              onClick={() => setActiveTab('upload')}
              className={`
                px-8 py-3 rounded-xl font-semibold transition-all duration-300 ease-out cursor-pointer text-sm
                ${activeTab === 'upload'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
                  : 'text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              📤 Upload
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`
                px-8 py-3 rounded-xl font-semibold transition-all duration-300 ease-out cursor-pointer text-sm
                ${activeTab === 'data'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
                  : 'text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              📊 View Data
            </button>
          </div>
        </div>

        <main>
          {activeTab === 'upload' ? (
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          ) : (
            <div className="max-w-5xl mx-auto">
              <DataListing key={refreshKey} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
