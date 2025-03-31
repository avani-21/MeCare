import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-teal-700 text-white py-10">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-gray-200 text-center">
        <div className="flex flex-col items-center  w-full">
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li className="hover:text-yellow-300 cursor-pointer">Features</li>
              <li className="hover:text-yellow-300 cursor-pointer">Pricing</li>
              <li className="hover:text-yellow-300 cursor-pointer">Case studies</li>
              <li className="hover:text-yellow-300 cursor-pointer">Reviews</li>
              <li className="hover:text-yellow-300 cursor-pointer">Updates</li>
            </ul>
          </div>

          <div className="pr-1">
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li className="hover:text-yellow-300 cursor-pointer">About</li>
              <li className="hover:text-yellow-300 cursor-pointer">Contact us</li>
              <li className="hover:text-yellow-300 cursor-pointer">Careers</li>
              <li className="hover:text-yellow-300 cursor-pointer">Culture</li>
              <li className="hover:text-yellow-300 cursor-pointer">Blog</li>
            </ul>
          </div>

         <div className="flex flex-col items-center md:items-start w-full">
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li className="hover:text-yellow-300 cursor-pointer">Getting started</li>
              <li className="hover:text-yellow-300 cursor-pointer">Help center</li>
              <li className="hover:text-yellow-300 cursor-pointer">Server status</li>
              <li className="hover:text-yellow-300 cursor-pointer">Report a bug</li>
              <li className="hover:text-yellow-300 cursor-pointer">Chat support</li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start w-full">
            <h3 className="text-lg font-semibold mb-4">Follow us</h3>
            <div className="flex flex-col space-y-3 w-full md:w-auto">
              <a href="#" className="flex items-center space-x-2 hover:text-yellow-300">
                <FaFacebookF className="text-xl" />
                <span>Facebook</span>
              </a>
              <a href="#" className="flex items-center space-x-2 hover:text-yellow-300">
                <FaTwitter className="text-xl" />
                <span>Twitter</span>
              </a>
              <a href="#" className="flex items-center space-x-2 hover:text-yellow-300">
                <FaInstagram className="text-xl" />
                <span>Instagram</span>
              </a>
              <a href="#" className="flex items-center space-x-2 hover:text-yellow-300">
                <FaLinkedinIn className="text-xl" />
                <span>LinkedIn</span>
              </a>
              <a href="#" className="flex items-center space-x-2 hover:text-yellow-300">
                <FaYoutube className="text-xl" />
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-10 text-center text-gray-300 text-sm mb-0">
          © {new Date().getFullYear()} All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
