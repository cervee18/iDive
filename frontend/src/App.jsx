import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              {/* Logo Placeholder */}
              <span className="text-2xl font-bold text-blue-600">iDive</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-900">Features</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Pricing</a>
              <a href="#" className="text-blue-600 font-medium">Login</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Manage your Dive Center</span>
            <span className="block text-blue-600">Without the hassle</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            iDive handles boat scheduling, staff payroll, and digital waivers so you can focus on what matters: getting people underwater.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                Get Started
              </a>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                Live Demo
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;