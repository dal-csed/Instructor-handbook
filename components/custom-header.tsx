import Image from "next/image"
import FlyoutLink, { QRContent } from "./flyout-link"

const CustomHeader = () => {
  return (
    <div className="w-full h-24">
      <div className="flex px-3 flex-row items-center justify-between gap-4 m-auto max-w-7xl h-full">
        <div className="h-14 w-50 relative">
          <Image src="/dal-logo.png" alt="Dalhousie University" fill />
        </div>
        <p className="title-page text-[#474646] text-4xl font-semibold">Instructor Handbook</p>

        <div className="flex flex-row items-center justify-between gap-x-1">
          <a
            href="https://csed.cs.dal.ca/"
            target="_blank"
            className="font-semibold py-2 px-3 hover:border-b-2 hover:mb-[-2] hover:border-[#ffcc00]"
            rel="noreferrer"
          >
            CSEd
          </a>
          <a
            href="https://projects.cs.dal.ca/justintime/dist/index.php"
            target="_blank"
            className="font-semibold py-2 px-3 hover:border-b-2 hover:mb-[-2] hover:border-[#ffcc00]"
            rel="noreferrer"
          >
            Just In Time Resources
          </a>

          <FlyoutLink href="#" FlyoutContent={QRContent}>
            Feedback
          </FlyoutLink>
        </div>
      </div>
    </div>
  )
}

export default CustomHeader
