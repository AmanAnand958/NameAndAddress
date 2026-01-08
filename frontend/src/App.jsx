import { useState, useRef } from 'react'
import { EncryptedText } from './components/ui/encrypted-text'
import { LoaderFive } from './components/ui/Loader'
import { BackgroundLines } from './components/ui/background-lines'
import { FloatingDock } from './components/ui/floating-dock'
import { PlaceholdersAndVanishInput } from './components/ui/placeholders-and-vanish-input'
import { CardSpotlight } from './components/ui/card-spotlight'
import { Button } from './components/ui/moving-border'
import { Meteors } from './components/ui/meteors'
import confetti from 'canvas-confetti'

function App() {
  const [addMessage, setAddMessage] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchMessage, setSearchMessage] = useState('')
  const [activeTab, setActiveTab] = useState('add')
  const [addLoading, setAddLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', address: '' })
  const [searchName, setSearchName] = useState('')

  const handleSearchVanishInput = (value) => {
    handleQuickSearch(value)
  }

  const addressInputRef = useRef(null)

  const handleNameSubmit = (value) => {
    setFormData(prev => ({ ...prev, name: value }))
    addressInputRef.current?.focus()
  }

  const handleAddressSubmit = (value) => {
    setFormData(prev => ({ ...prev, address: value }))
    handleAdd({ preventDefault: () => {} })
  }

  const handleAdd = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const name = formData.name
    const address = formData.address
    if (!name || !address) {
      setAddMessage('Please provide both name and address')
      return
    }
    setAddLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:5000/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, address }),
      })
      const data = await response.json()
      if (response.ok) {
        setAddMessage(data.message)
        setFormData({ name: '', address: '' })
        if (e && e.target && e.target.reset) e.target.reset()
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      } else {
        setAddMessage(data.error)
      }
    } catch {
      setAddMessage('Error adding record')
    } finally {
      setAddLoading(false)
    }
  }

  const handleQuickSearch = async (name) => {
    if (!name) return
    setSearchResult(null)
    setSearchMessage('')
    setSearchLoading(true)
    
    // Start timer for minimum generic loading delay
    const startTime = Date.now()
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/search?name=${encodeURIComponent(name)}`)
      const data = await response.json()
      
      if (response.ok) {
        setSearchResult(data)
      } else {
        setSearchMessage(data.message)
      }
    } catch {
      setSearchMessage('Error searching record')
    } finally {
      // Ensure specific minimum duration of 3 seconds
      const elapsed = Date.now() - startTime
      const remaining = 3000 - elapsed
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining))
      }
      setSearchLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    const name = searchName || e.target.searchName.value
    await handleQuickSearch(name)
  }

  return (
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
      <div className="min-h-screen relative flex flex-col items-center justify-center gap-10 w-full">
        
        <div className="max-w-md w-full space-y-8 relative z-10 z-[20]">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              <EncryptedText text="Name and Address Database" encrypted={true} duration={1500} />
            </h2>
          </div>

        {/* Add Form */}
        {activeTab === 'add' && (
        <CardSpotlight className="p-8">
          <h3 className="text-xl font-bold text-neutral-200 mb-6 z-20 relative">Add a Record</h3>
          <form onSubmit={handleAdd} className="space-y-6 relative z-20">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
                Name
              </label>
              <PlaceholdersAndVanishInput
                placeholders={['Enter name', 'John Doe', 'Your name here']}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                onSubmit={handleNameSubmit}
                vanishOnSubmit={false}
                value={formData.name}
              />
              <input
                id="name"
                name="name"
                type="text"
                hidden
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-neutral-300 mb-2">
                Address
              </label>
              <PlaceholdersAndVanishInput
                ref={addressInputRef}
                placeholders={['Enter address', '123 Main St', 'Your address here']}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                onSubmit={handleAddressSubmit}
                value={formData.address}
              />
              <input
                id="address"
                name="address"
                type="text"
                hidden
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="flex justify-center pt-4">
              <Button
                borderRadius="1.75rem"
                className="bg-slate-900 text-white border-neutral-200 dark:border-slate-800"
                type="submit"
                disabled={addLoading}
              >
                {addLoading ? 'Adding...' : 'Add Record'}
              </Button>
            </div>
          </form>
          {addLoading && (
            <div className="mt-4 relative z-20">
              <p className="text-center text-sm text-indigo-400">Adding record...</p>
            </div>
          )}
          {addMessage && !addLoading && (
            <p className="mt-4 text-sm text-green-400 relative z-20">{addMessage}</p>
          )}
        </CardSpotlight>
        )}

        {/* Search Form */}
        {activeTab === 'search' && (
        <CardSpotlight className="p-8">
          <h3 className="text-xl font-bold text-neutral-200 mb-6 z-20 relative">Search for a Record</h3>
          <form onSubmit={handleSearch} className="space-y-6 relative z-20">
            <div>
              <label htmlFor="searchName" className="block text-sm font-medium text-neutral-300 mb-2">
                Name to search
              </label>
              <PlaceholdersAndVanishInput
                placeholders={['Enter name to search', 'Find by name', 'Search here']}
                onChange={(e) => setSearchName(e.target.value)}
                onSubmit={handleSearchVanishInput}
              />
              <input
                id="searchName"
                name="searchName"
                type="text"
                hidden
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="flex justify-center pt-4">
              <Button
                borderRadius="1.75rem"
                className="bg-slate-900 text-white border-neutral-200 dark:border-slate-800"
                type="submit"
                disabled={searchLoading}
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>
          {searchLoading && (
            <div className="mt-4 relative z-20">
              <div className="flex justify-center items-center h-20 text-white">
                <LoaderFive text="Searching..." />
              </div>
            </div>
          )}
          {searchResult && !searchLoading && (
            <div className="mt-6 w-full relative max-w-xs">
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] bg-red-500 rounded-full blur-3xl" />
              <div className="relative shadow-xl bg-gray-900 border border-gray-800  px-4 py-8 h-full overflow-hidden rounded-2xl flex flex-col justify-end items-start text-white">
                <div className="h-5 w-5 rounded-full border flex items-center justify-center mb-4 border-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-2 w-2 text-gray-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"
                    />
                  </svg>
                </div>
     
                <h1 className="font-bold text-xl text-white mb-4 relative z-50">
                  {searchResult.name}
                </h1>
     
                <div className="font-normal text-base text-slate-500 mb-4 relative z-50 max-h-40 overflow-y-auto">
                  {searchResult.addresses.map((addr, index) => (
                    <p key={index} className="mb-1 border-b border-gray-700/50 pb-1 last:border-0 last:pb-0">
                      {addr}
                    </p>
                  ))}
                </div>
     
                <Meteors number={20} />
              </div>
            </div>
          )}
          {searchMessage && !searchLoading && (
            <p className="mt-4 text-sm text-red-400 relative z-20">{searchMessage}</p>
          )}
        </CardSpotlight>
        )}
        </div>

        <div className="relative z-50">
          <FloatingDock
            items={[
              {
                title: 'Input Data',
                icon: '✏️',
                onClick: () => setActiveTab('add'),
              },
              {
                title: 'Fetch Data',
                icon: '🔍',
                onClick: () => setActiveTab('search'),
              },
            ]}
          />
        </div>
      </div>
    </BackgroundLines>
  )
}

export default App
