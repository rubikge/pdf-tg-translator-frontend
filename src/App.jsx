import PdfViewer from './components/PdfViewer'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            PDF Translator
          </h1>
          <p className="text-gray-600">
            Open and view PDF documents
          </p>
        </header>
        
        <main>
          <PdfViewer />
        </main>
      </div>
    </div>
  )
}

export default App

