import { useRouteError, isRouteErrorResponse } from "react-router-dom";

// ----------------------------------------------------------------------

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full border border-gray-700">
        {renderErrorMessage(error)}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------

function parseStackTrace(stack) {
  if (!stack) return { filePath: null, functionName: null };

  const filePathMatch = stack.match(/\/src\/[^?]+/);
  const functionNameMatch = stack.match(/at (\S+)/);

  return {
    filePath: filePathMatch ? filePathMatch[0] : null,
    functionName: functionNameMatch ? functionNameMatch[1] : null,
  };
}

function renderErrorMessage(error) {
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <div className="flex items-center mb-6">
          <div className="bg-red-500/20 p-3 rounded-full mr-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {error.status}: {error.statusText}
          </h1>
        </div>
        <p className="text-gray-300 mb-6 text-lg">{error.data}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
        >
          Reload Page
        </button>
      </>
    );
  }

  if (error instanceof Error) {
    const { filePath, functionName } = parseStackTrace(error.stack);

    return (
      <>
        <div className="flex items-center mb-6">
          <div className="bg-yellow-500/20 p-3 rounded-full mr-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Unexpected Application Error!</h1>
        </div>

        <div className="mb-6 p-4 bg-red-400/10 rounded-lg border border-red-500/30">
          <p className="text-red-400 font-mono text-sm md:text-base">
            {error.name}: {error.message}
          </p>
        </div>

        {error.stack && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Stack Trace</h2>
            <pre className="bg-gray-900/50 p-4 rounded-lg overflow-x-auto text-xs md:text-sm text-yellow-400 font-mono border border-gray-700">
              {error.stack}
            </pre>
          </div>
        )}

        {(filePath || functionName) && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Source Location</h2>
            <div className="flex items-center text-blue-400 font-mono text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {filePath} ({functionName})
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Reload Page
          </button>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Go Back
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center mb-6">
        <div className="bg-gray-500/20 p-3 rounded-full mr-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Unknown Error</h1>
      </div>
      <p className="text-gray-400 mb-6">An unexpected error occurred, but we couldn't determine the details.</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
      >
        Reload Page
      </button>
    </>
  );
}