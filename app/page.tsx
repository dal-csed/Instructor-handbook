export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-3 py-6">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-[#474646] text-balance">Welcome to the Instructor Handbook</h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          This is a placeholder for the home page content. Here you can include an introduction to the 
          Instructor Handbook, important announcements, quick links, and featured resources for TAs at Dalhousie
          University's Faculty of Computer Science.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-[#474646]">Getting Started</h2>
            <p className="text-gray-600">
              New to being an Instructor? Start here to learn about your responsibilities and expectations.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-[#474646]">Quick Resources</h2>
            <p className="text-gray-600">Access important forms, contact information, and commonly needed materials.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
