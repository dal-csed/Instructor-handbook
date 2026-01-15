export default function ResourcesPage() {
  return (
    <div className="max-w-7xl mx-auto px-3 py-12">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-[#474646] text-balance">Instructor Resources</h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          This is a placeholder for the resources page content. Provide links to downloadable forms, important
          documents, teaching materials, grading guidelines, and other essential resources for instructors.
        </p>
        <div className="space-y-4 mt-8">
          <h2 className="text-2xl font-semibold text-[#474646]">Essential Documents</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Placeholder link to instructor contract template</li>
            <li>Placeholder link to grading rubrics</li>
            <li>Placeholder link to course planning guide</li>
            <li>Placeholder link to academic integrity policies</li>
          </ul>
          <h2 className="text-2xl font-semibold text-[#474646] mt-8">Teaching Materials</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Placeholder link to lecture templates</li>
            <li>Placeholder link to lab activity ideas</li>
            <li>Placeholder link to assessment tools</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
