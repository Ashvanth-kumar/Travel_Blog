import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { ADD_USER } from '../utils/mutations';
import Auth from '../utils/auth';
import Layout from '../components/Layout/Dashboard';
import { UserIcon, AtSymbolIcon, LockClosedIcon, ArrowLongRightIcon, MapPinIcon, BriefcaseIcon } from '@heroicons/react/24/solid';

const Signup = () => {
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    password: '',
    location: '',
    description: '',
  });
  const [addUser, { error, loading }] = useMutation(ADD_USER);
  const [submitError, setSubmitError] = useState(null); // For user-facing error messages

  // Update state based on form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  // Submit form with validation and error handling
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null); // Reset error state

    // Basic client-side validation
    if (!formState.username || !formState.email || !formState.password) {
      setSubmitError('Username, email, and password are required.');
      return;
    }

    try {
      const { data } = await addUser({
        variables: { ...formState },
      });

      if (!data?.addUser?.token) {
        throw new Error('No token returned from server');
      }

      Auth.login(data.addUser.token); // Log the user in with the returned token
    } catch (e) {
      console.error('Signup error:', e);
      setSubmitError(e.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="w-full h-screen">
        <div className="signup bg-signup bg-fixed bg-cover w-full h-full flex flex-col justify-center items-center px-4">
          <div className="mb-8 flex flex-col justify-center items-center text-white z-[1]">
            <h1>Sign Up</h1>
            <h2>Join the travel community</h2>
          </div>
          <div className="card">
            <form className="w-full max-w-[500px]" onSubmit={handleFormSubmit}>
              <div className="relative">
                <div className="icons">
                  <UserIcon width={20} />
                </div>
                <input
                  placeholder="Enter username"
                  name="username"
                  type="text" // Changed from "username" to "text"
                  id="username"
                  value={formState.username}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <div className="icons">
                  <AtSymbolIcon width={20} />
                </div>
                <input
                  placeholder="Enter email address"
                  name="email"
                  type="email"
                  id="email"
                  value={formState.email}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <div className="icons">
                  <LockClosedIcon width={20} />
                </div>
                <input
                  placeholder="Password"
                  name="password"
                  type="password"
                  id="password"
                  value={formState.password}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <div className="icons">
                  <MapPinIcon width={20} />
                </div>
                <input
                  placeholder="Location"
                  name="location"
                  type="text" // Changed from "location" to "text"
                  id="location"
                  value={formState.location}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <div className="icons">
                  <BriefcaseIcon width={20} />
                </div>
                <input
                  placeholder="Tell us a little about yourself"
                  name="description"
                  type="text" // Changed from "description" to "text"
                  id="description"
                  value={formState.description}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="primary" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Display errors */}
              {(error || submitError) && (
                <div className="text-sm text-red-600 italic mt-2">
                  {submitError || 'Signup failed. Please check your details and try again.'}
                </div>
              )}

              <div className="w-full flex justify-center items-center text-sm leading-loose">
                Already a member?
                <Link to="/login" className="inline-flex items-center ml-2 text-teal-400 hover:text-teal-200">
                  Login <ArrowLongRightIcon width={25} className="inline-flex items-center ml-1" />
                </Link>
              </div>
            </form>
          </div>
          <div className="w-full h-full absolute top-0 left-0 bg-gradient-to-r opacity-80 from-teal-100 via-slate-600 to-sky-800 z-0"></div>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;