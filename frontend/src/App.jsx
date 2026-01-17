import { useState } from 'react'
import { EncryptedText } from './components/ui/encrypted-text'
import { BackgroundLines } from './components/ui/background-lines'
import { FloatingDock } from './components/ui/floating-dock'
import { AuroraBackground } from './components/ui/aurora-background'
import { PlaceholdersAndVanishInput } from './components/ui/placeholders-and-vanish-input'

function App() {
  const [addMessage, setAddMessage] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchMessage, setSearchMessage] = useState('')
  const [showAddForm, setShowAddForm] = useState(true)
  const [showSearchForm, setShowSearchForm] = useState(true)
  const [addLoading, setAddLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', address: '' })

  const handleAddVanishInput = (value) => {
    setFormData({ ...formData, name: value })
  }

  const handleAddressVanishInput = (value) => {
    setFormData({ ...formData, address: value })
  }

  const handleSearchVanishInput = (value) => {
    handleQuickSearch(value)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const name = formData.name || e.target.name.value
    const address = formData.address || e.target.address.value
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
        e.target.reset()
      } else {
        setAddMessage(data.error)
      }
    } catch (error) {
      setAddMessage('Error adding record')
    } finally {
      setAddLoading(false)
    }
  }

  const handleQuickSearch = async (name) => {
    if (!name) return
    setSearchLoading(true)
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/search?name=${encodeURIComponent(name)}`)
      const data = await response.json()
      if (response.ok) {
        setSearchResult(data)
        setSearchMessage('')
      } else {
        setSearchResult(null)
        setSearchMessage(data.message)
      }
    } catch (error) {
      setSearchResult(null)
      setSearchMessage('Error searching record')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    const name = e.target.searchName.value
    await handleQuickSearch(name)
  }

  return (
    <AuroraBackground>
      <div className="min-h-screen relative flex items-center justify-center">
        <FloatingDock
          items={[
            {
              title: 'Input Data',
              icon: '✏️',
              onClick: () => setShowAddForm(!showAddForm),
            },
            {
              title: 'Fetch Data',
              icon: '🔍',
              onClick: () => setShowSearchForm(!showSearchForm),
            },
          ]}
        />
        
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              <EncryptedText text="Name and Address Database" encrypted={true} duration={1500} />
            </h2>
          </div>

        {/* Add Form */}
        {showAddForm && (
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add a Record</h3>
          <form onSubmit={handleAdd} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <PlaceholdersAndVanishInput
                placeholders={['Enter name', 'John Doe', 'Your name here']}
                onSubmit={handleAddVanishInput}
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
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <PlaceholdersAndVanishInput
                placeholders={['Enter address', '123 Main St', 'Your address here']}
                onSubmit={handleAddressVanishInput}
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
            <button
              type="submit"
              disabled={addLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addLoading ? 'Adding...' : 'Add Record'}
            </button>
          </form>
          {addLoading && (
            <div className="mt-4">
              <p className="text-center text-sm text-indigo-600">Adding record...</p>
            </div>
          )}
          {addMessage && !addLoading && (
            <p className="mt-4 text-sm text-green-600">{addMessage}</p>
          )}
        </div>
        )}

        {/* Search Form */}
        {showSearchForm && (
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search for a Record</h3>
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="searchName" className="block text-sm font-medium text-gray-700 mb-2">
                Name to search
              </label>
              <PlaceholdersAndVanishInput
                placeholders={['Enter name to search', 'Find by name', 'Search here']}
                onSubmit={handleSearchVanishInput}
              />
              <input
                id="searchName"
                name="searchName"
                type="text"
                hidden
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {searchLoading && (
            <div className="mt-4">
              <p className="text-center text-sm text-indigo-600">Searching...</p>
            </div>
          )}
          {searchResult && !searchLoading && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-800">Name: {searchResult.name}</p>
              <p className="text-sm text-green-700">Address: {searchResult.address}</p>
            </div>
          )}
          {searchMessage && !searchLoading && (
            <p className="mt-4 text-sm text-red-600">{searchMessage}</p>
          )}
        </div>
        )}
        </div>
      </div>
    </AuroraBackground>
  )
}

export default App
