import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <Link href="/">
              <a className="text-primary-600 dark:text-primary-400 text-xl font-bold">
                Echo<span className="text-accent-500">Vault</span>
              </a>
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} EchoVault. All rights reserved.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2 justify-center md:justify-start">
            <Link href="/privacy">
              <a className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
                Privacy Policy
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
                Terms of Service
              </a>
            </Link>
            <Link href="/contact">
              <a className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
                Contact
              </a>
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1 text-center md:text-left">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Securely preserve your digital legacy with EchoVault
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
