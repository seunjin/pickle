export const LoginScreen = () => {
  const handleConnect = () => {
    // Opens the Web App Sync Page
    // TODO: Use env var for URL in real prod, hardcoded for local dev as per context
    chrome.tabs.create({ url: "http://localhost:3000/auth/sync" });
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-indigo-600"
        >
          <title>Pickle</title>
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="mb-2 font-bold text-gray-900 text-xl">
        Welcome to Pickle
      </h1>
      <p className="mb-8 text-gray-500 text-sm">
        Connect your account to start saving notes and captures.
      </p>

      <button
        type="button"
        onClick={handleConnect}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-sm text-white shadow-md transition-colors hover:bg-indigo-700 active:bg-indigo-800"
      >
        Connect Account
      </button>

      <p className="mt-4 text-gray-400 text-xs">
        Opens a new tab to sync authentication
      </p>
    </div>
  );
};
