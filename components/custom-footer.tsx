const CustomFooter = () => {
  return (
    <div>
      <footer className="bg-black text-white text-xs text-center py-8 border-t-4 border-[#ffcc00]">
        <div className="flex flex-row max-w-7xl px-3 m-auto justify-between">
          <div className="flex flex-col gap-y-8">
            <div>
              <p className="font-bold justify-self-start">Faculty of Computer Science</p>
              <p className="justify-self-start">Goldberg Computer Science Building</p>
            </div>
            <div>
              <p className="font-bold justify-self-start">Dalhousie University</p>
              <p className="justify-self-start">Halifax, Nova Scotia, Canada B3H 4R2</p>
              <p className="justify-self-start">1-902-494-2211</p>
            </div>
          </div>
          <div className="content-center text-lg">
            <p className="font-semibold justify-self-start"> © Created by CSEd</p>
            <p className="font-light justify-self-start">Faculty of Computer Science</p>
            <p className="font-light justify-self-start">Dalhousie University</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CustomFooter
