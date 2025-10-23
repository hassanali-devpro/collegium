import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetStudentsQuery } from '../../features/students/studentApi';

/**
 * Test component to demonstrate 401 error handling
 * This component can be used to test the automatic logout functionality
 * when a 401 error occurs on any API call.
 */
const Test401Error = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  
  // This will trigger a 401 error if the token is invalid/expired
  const { data, error, isLoading } = useGetStudentsQuery();

  const simulateInvalidToken = () => {
    // Simulate an expired/invalid token by modifying sessionStorage
    const auth = JSON.parse(sessionStorage.getItem('auth') || '{}');
    auth.token = 'invalid-token';
    sessionStorage.setItem('auth', JSON.stringify(auth));
    
    // Force a refetch to trigger the 401 error
    window.location.reload();
  };

  if (!token) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <h3 className="font-bold text-yellow-800">Test 401 Error Handling</h3>
        <p className="text-yellow-700">You are not logged in. Please login first to test the 401 error handling.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded">
      <h3 className="font-bold text-blue-800 mb-2">Test 401 Error Handling</h3>
      <p className="text-blue-700 mb-4">
        This component demonstrates the automatic logout functionality when a 401 error occurs.
      </p>
      
      <button
        onClick={simulateInvalidToken}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Simulate Invalid Token (Trigger 401)
      </button>
      
      {isLoading && <p className="text-blue-600 mt-2">Loading...</p>}
      {error && <p className="text-red-600 mt-2">Error: {error.message}</p>}
      {data && <p className="text-green-600 mt-2">Data loaded successfully</p>}
    </div>
  );
};

export default Test401Error;
