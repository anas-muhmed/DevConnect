// src/pages/ComingSoonPage.jsx

import { AlertTriangle } from "lucide-react";

const ComingSoonPage = ({ feature = "This feature" }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-6">
      <div className="flex flex-col items-center bg-gray-800 border border-gray-700 rounded-2xl p-10 shadow-xl max-w-md text-center">
        <AlertTriangle className="h-14 w-14 text-yellow-400 mb-4" />
        <h1 className="text-3xl font-bold mb-2">{feature} is Coming Soon 🚧</h1>
        <p className="text-gray-300 text-sm">
          We're still building this part of the app. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
};

export default ComingSoonPage;
