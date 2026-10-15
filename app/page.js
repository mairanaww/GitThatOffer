"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import {
  ChartBarIcon,
  BellAlertIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/solid";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export default function Home() {
  const { data: session, status } = useSession();

  const features = [
    {
      icon: <ChartBarIcon className="h-12 w-12 text-blue-500" />,
      title: " Intuitive Smart Tracking",
      description:
        "Track all your applications, deadlines, and progress in one dashboard.",
    },
    {
      icon: <BellAlertIcon className="h-12 w-12 text-blue-500" />,
      title: "Never Miss Deadlines",
      description:
        "Get timely reminders for application deadlines and interview dates.",
    },
    {
      icon: <AdjustmentsHorizontalIcon className="h-12 w-12 text-blue-500" />,
      title: "Personalized Matches",
      description:
        "Get company recommendations based on your profile and preferences.",
    },
  ];

  // Simple redirect logic - only redirect if authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      window.location.replace("/dashboard");
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#111020] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-200">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show redirecting message - just show the landing page
  return (
    <div className="min-h-screen bg-[#111020]">
      {/* Navigation */}
      <nav className="bg-[bg-[#111020]] backdrop-blur-md border-b pb-10 pt-12 border-gray-900 px-6 py-4 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <div className="flex items-center space-x-3">
            <div className="logo-container">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm2 2V5h1v1h-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-200 slide-in-left">
              GitThatOffer
            </h1>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="status-badge fade-in-up mx-auto">
                <div className="pulse-dot"></div>
                MIT Internship Portal
              </div>

              <h1 className="hero-title text-white fade-in-up-delay-1">
                GitThat
                <span className="text-blue-500 relative">
                  Offer
                  <div className="title-underline"></div>
                </span>
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto fade-in-up-delay-2">
                Connect with top companies, track application deadlines, and
                never miss an opportunity. Your dream job awaits.
              </p>
            </div>

            <div className="fade-in-up-delay-3">
              <button
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "/auth/callback",
                    prompt: "select_account",
                  })
                }
                className="cta-button group"
              >
                <svg className="w-5 h-5 mr-3 google-icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
                <svg
                  className="w-4 h-4 ml-2 arrow-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#111020] py-20 pt-[-10]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-300 mb-4 fade-in-up">
              Why Choose GitThatOffer?
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto fade-in-up-delay-1">
              Everything you need to land your dream job, all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-8 bg-gray-800/30 backdrop-blur-2xl rounded-2xl border border-white/30 dark:border-white/20 transition duration-500 transform hover:-translate-y-2 hover:scale-105"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="mb-4 drop-shadow">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-[#111020] px-6 pb-26 mb-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-gray-800/40 border border-gray-700 backdrop-blur-lg rounded-2xl px-6 py-6 shadow-md fade-in-up flex flex-col items-center text-justify md:pl-20 md:pr-20 pr-7 pl-7">
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Important Disclaimer!
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed space-y-3 pb-6 text-center">
              <span className="text-gray-300 font-medium">
                GitThatOffer
              </span>{" "}
              is a student-centric platform designed to help you organize,
              track, and set reminders for your internship and job applications.
              <span className="block mt-2">
                <span className="text-red-400 font-semibold">
                  Important Note:
                </span>{" "}
                GitThatOffer is{" "}
                <span className="text-red-400 font-semibold">
                  not affiliated with any companies or hiring organizations,
                </span>{" "}
                and we do not guarantee job offers. This platform is meant to
                support your application journey — not replace official portals.
              </span>
              <span className="block mt-2 text-red-400 font-semibold">
                The GitThatOffer team is not liable for any missed deadlines,
                incorrect details, or outcomes resulting from the information
                displayed on this platform.
              </span>
              <span className="block mt-2">
                Always{" "}
                <span className="text-yellow-400 font-medium">
                  double-check
                </span>{" "}
                all job descriptions, company info, and application timelines
                directly through official sources.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#111020] border-t border-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* brand */}
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="logo-container">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm2 2V5h1v1h-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-200">GitThatOffer</h1>
          </div>

          {/* copyright */}
          <p className="text-gray-400 mb-8">
            © 2025 GitThatOffer. Empowering students to land their dream jobs.{" "}
          </p>
        </div>
      </footer>

      <style jsx>{`
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f4f6;
          border-top: 3px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .logo-container {
          animation: logoFloat 3s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        .fade-in-up-delay-1 {
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .fade-in-up-delay-2 {
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .fade-in-up-delay-3 {
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 500;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .hero-title {
          font-size: clamp(3rem, 8vw, 5rem);
          font-weight: 800;
          line-height: 1.1;
          color: white;
        }

        .title-underline {
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 100%;
          height: 4px;
          background: #bfdbfe;
          border-radius: 2px;
        }

        .title-underline::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: #2563eb;
          border-radius: 2px;
          animation: underlineGrow 2s ease-out 1s both;
        }

        @keyframes underlineGrow {
          from {
            width: 0%;
          }
          to {
            width: 60%;
          }
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background: #2563eb;
          border: none;
          border-radius: 12px;
          box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.3);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .cta-button:hover {
          background: #1d4ed8;
          box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.4);
          transform: translateY(-2px);
        }

        .google-icon {
          transition: transform 0.3s ease;
        }

        .cta-button:hover .google-icon {
          transform: scale(1.1);
        }

        .arrow-icon {
          transition: transform 0.3s ease;
        }

        .cta-button:hover .arrow-icon {
          transform: translateX(4px);
        }

        .feature-card {
          text-align: center;
          padding: 32px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06);
          border: 1px solid #f3f4f6;
          transition: all 0.3s ease;
          animation: fadeInUp 0.6s ease-out both;
        }

        .feature-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transform: translateY(-8px);
        }

        .feature-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
}
