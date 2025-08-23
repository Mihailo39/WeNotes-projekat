import React from 'react';
import RegisterForm from '../components/forms/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WeNotes</h1>
          <p className="text-gray-600">Platforma za upravljanje beleškama</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
