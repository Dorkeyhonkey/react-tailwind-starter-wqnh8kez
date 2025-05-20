import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { ChevronRight, Check, Calendar, Users, Shield, FileText } from "lucide-react";

const Home = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-10" 
               style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582630699873-1848e76872a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')" }}></div>
          <div className="relative pt-10 pb-20 sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
                  Preserve Your Legacy,<br/>Share When The Time Is Right
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                  EchoVault helps you create secure digital time capsules containing your most precious memories, important documents, and personal messages - delivered to your loved ones exactly when you want.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Button
                    onClick={() => navigate("/register")}
                    size="lg"
                    className="text-base px-6 py-3"
                  >
                    Create Your Vault
                  </Button>
                  <a href="#how-it-works" className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center">
                    Learn more <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">Secure & Reliable</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Everything you need for your digital legacy</p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Our platform combines state-of-the-art security with thoughtful design to ensure your most important memories and messages are preserved and delivered exactly as you intend.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                <div className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-700">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    Bank-Level Security
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                    Your data is encrypted using AES-256 encryption, the same technology used by banks and government agencies to secure sensitive information.
                  </dd>
                </div>
                <div className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-700">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    Time-Based Delivery
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                    Schedule exactly when your content is delivered - on a specific date, after a certain event, or triggered by custom conditions you define.
                  </dd>
                </div>
                <div className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-700">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    Multi-Media Support
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                    Store photos, videos, audio recordings, documents, and written messages – preserving your legacy in the formats that matter most.
                  </dd>
                </div>
                <div className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-700">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    Recipient Management
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                    Specify exactly who receives what content, with customizable access levels and delivery methods for each recipient.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="bg-gray-50 dark:bg-gray-800 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">Simple Process</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">How EchoVault Works</p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Creating and managing your digital legacy is straightforward with our intuitive platform.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:max-w-none">
              <div className="grid grid-cols-1 gap-y-10 gap-x-8 lg:grid-cols-3">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-600 dark:bg-primary-700 text-white font-bold text-lg">1</div>
                  <h3 className="mt-6 text-lg font-semibold leading-8 text-gray-900 dark:text-white">Create Your Vault</h3>
                  <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                    Sign up, verify your identity, and create your first secure digital vault with customizable security settings.
                  </p>
                </div>

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-600 dark:bg-primary-700 text-white font-bold text-lg">2</div>
                  <h3 className="mt-6 text-lg font-semibold leading-8 text-gray-900 dark:text-white">Add Your Content</h3>
                  <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                    Upload documents, photos, videos, and write messages to be preserved and shared according to your wishes.
                  </p>
                </div>

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-600 dark:bg-primary-700 text-white font-bold text-lg">3</div>
                  <h3 className="mt-6 text-lg font-semibold leading-8 text-gray-900 dark:text-white">Set Delivery Conditions</h3>
                  <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                    Choose who receives your content and when - whether on a specific date or triggered by certain events.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-white dark:bg-gray-900 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">Testimonials</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">What Our Users Say</p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col rounded-2xl bg-gray-50 dark:bg-gray-800 p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="flex items-center gap-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium">
                    MB
                  </div>
                  <div>
                    <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-white">Michael B.</h3>
                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">Estate Planner</p>
                  </div>
                </div>
                <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
                  "I recommend EchoVault to all my clients as an essential complement to their estate planning. It provides a secure, dignified way to pass on personal messages and important digital assets."
                </p>
              </div>
              <div className="flex flex-col rounded-2xl bg-gray-50 dark:bg-gray-800 p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="flex items-center gap-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium">
                    SR
                  </div>
                  <div>
                    <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-white">Sarah R.</h3>
                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">Mother of three</p>
                  </div>
                </div>
                <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
                  "Creating video messages for my children to receive on important birthdays in the future was incredibly meaningful. The platform made it so easy, and I have peace of mind knowing they're secure."
                </p>
              </div>
              <div className="flex flex-col rounded-2xl bg-gray-50 dark:bg-gray-800 p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="flex items-center gap-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium">
                    JL
                  </div>
                  <div>
                    <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-white">James L.</h3>
                    <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">Business owner</p>
                  </div>
                </div>
                <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
                  "As someone managing multiple businesses, I needed a place to securely store critical information that would only be accessible to the right people at the right time. EchoVault exceeded my expectations."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative isolate mt-16 sm:mt-24">
          <div className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-10" 
               style={{ backgroundImage: "url('https://images.unsplash.com/photo-1619028972730-01f1541582dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')" }}></div>
          <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Ready to secure your digital legacy?</h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                Start creating your EchoVault today and ensure your most meaningful moments and messages reach the right people at the right time.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button
                  onClick={() => navigate("/register")}
                  size="lg"
                  className="text-base px-6 py-3"
                >
                  Get Started
                </Button>
                <a href="#" className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center">
                  Contact Us <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="bg-white dark:bg-gray-900 py-16">
          <div className="mx-auto max-w-md px-6">
            <LoginForm />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
