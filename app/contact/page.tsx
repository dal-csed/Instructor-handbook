export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-3 py-12">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-[#474646] text-balance">Contact Us</h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          This is a placeholder for the contact page content. Include contact information for the instructor
          coordinator, administrative staff, CSEd team, and other relevant departments.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-[#474646]">Instructor Coordinator</h2>
            <p className="text-gray-600 space-y-1">
              <span className="block">Email: placeholder@dal.ca</span>
              <span className="block">Office: Goldberg CS Building, Room XXX</span>
              <span className="block">Phone: 1-902-494-XXXX</span>
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-[#474646]">CSEd Team</h2>
            <p className="text-gray-600 space-y-1">
              <span className="block">Email: csed@dal.ca</span>
              <span className="block">Website: csed.cs.dal.ca</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
