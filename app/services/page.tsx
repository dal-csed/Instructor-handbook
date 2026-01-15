export default function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-3 py-12">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-[#474646] text-balance">Instructor Services & Support</h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          This is a placeholder for the services page content. List the various services available to instructors
          including training programs, technical support, mentoring opportunities, and professional development
          resources.
        </p>
        <div className="grid gap-6 mt-8">
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-[#474646]">Training Programs</h2>
            <p className="text-gray-600">
              Placeholder for information about instructor training sessions and workshops.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-[#474646]">Technical Support</h2>
            <p className="text-gray-600">Placeholder for technical support resources and IT services.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-[#474646]">Mentoring</h2>
            <p className="text-gray-600">Placeholder for mentoring programs and peer support information.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
