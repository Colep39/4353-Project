"use client";
import { ErrorMessage, Formik, Field, Form } from 'formik';
import { useEffect } from 'react';
import Link from 'next/link';
import { Bungee } from "next/font/google";

const bungee = Bungee({
  subsets: ["latin"],
  weight: "400",
});

const validateFields = (values) => {
  const errors = {};
  if (!values.email) {
    errors.email = 'Required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  if (!values.password) {
    errors.password = "Required";
  }
  return errors;
}

export default function RegisterPage() {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      alert("You are already logged in")
      window.location.href = "/profile";
      return;
    }
  }, []);

  return (
    <div
      className="relative h-[calc(100vh-64px)] w-screen overflow-hidden bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
    >
      <div className={` ${bungee.className} backdrop-blur-xs bg-white/30 border border-white/40 rounded-2xl shadow-xl w-full max-w-4xl flex flex-col md:flex-row items-stretch overflow-hidden`}>
        <div className="flex-1 flex flex-col justify-center px-8 py-12 text-white-300">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow">Unlock Your Potential</h1>
          <p className="text-lg max-w-md drop-shadow">
            Join a community of driven individuals. Stay inspired, stay motivated, and achieve your goals.
            Your journey starts here. Log in the view current events, or sign up to be a part of the team!
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center px-10 py-12 bg-white/10">
          <Formik initialValues={{ email: "", password: "" }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: values.email,
                    password: values.password
                  })
                });

                const data = await res.json();

                if (!res.ok) {
                  alert(`Error: ${data.error || "Request failed"}`); // change from alert so ugly
                  return;
                }

                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("refresh_token", data.refresh_token);

                window.location.href = "/profile";
              } catch (e) {
                alert("Server error");
              } finally {
                setSubmitting(false);
              }
            }}
            validate={validateFields}>
            <Form className="flex flex-col gap-4 w-full max-w-sm">
              <p className="text-lg font-semibold text-center text-white-300 drop-shadow">Welcome back! Please log in.</p>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white-300">Email Address</label>
                <Field className="font-sans border border-white/50 bg-white/70 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  id="email" name="email" placeholder="Email Address" />
                <ErrorMessage name="email" component="div" className="text-red-300 text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-white-300">Password</label>
                <Field className="font-sans border border-white/50 bg-white/70 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  id="password" name="password" placeholder="Password" type="password" />
                <ErrorMessage name="password" component="div" className="text-red-300 text-sm" />
              </div>
              <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition cursor-pointer">Log In</button>
              <Link className="text-gray-800 hover:text-blue-900 underline text-sm text-left" href="/forgot">Forgot Password?</Link>
              <Link className="text-gray-800 hover:text-blue-900 underline text-sm text-left" href="/register">Sign Up</Link>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
}
