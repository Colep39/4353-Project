"use client";
import { ErrorMessage, Formik, Field, Form } from 'formik';
import Link from 'next/link';

const validateFields = (values) => {
    const errors = {};

    if (!values.email) {
        errors.email = 'Required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
    }

    if (!values.password) {
        errors.password = "Required";
    };

    return errors;
}

export default function RegisterPage() {
    return (
        <div
            className="relative h-[calc(100vh-64px)] w-screen overflow-hidden bg-cover bg-center bg-no-repeat flex items-start justify-center p-6 pt-40"
            style={{ backgroundImage: "url('/images/login-bg.png')" }}
        >
            <Formik
                initialValues={{
                    email: "",
                    password: ""
                }}

                onSubmit={(values) => {
                    alert(`Submitted:\n${JSON.stringify(values, null, 2)}`);
                    // insert api call to save
                }}

                validate={validateFields}
            >
                <Form className="bg-white border p-6 rounded flex flex-col gap-4 w-full max-w-md">
                    <p className="text-lg font-semibold text-center">Welcome back! Please log in.</p>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">
                            Email Address
                        </label>
                        <Field
                            className="border px-3 py-2 rounded"
                            id="email"
                            name="email"
                            placeholder="Email Address"
                        />
                        <ErrorMessage
                            name="email"
                            component="div"
                            className="text-red-500 text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">
                            Password
                        </label>
                        <Field
                            className="border px-3 py-2 rounded"
                            id="password"
                            name="password"
                            placeholder="Password"
                            type="password"
                        />
                        <ErrorMessage
                            name="password"
                            component="div"
                            className="text-red-500 text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                    >
                        Log In
                    </button>

                    <Link className="text-blue-500 underline" href="/forgot">Forgot password?</Link>
                    <Link className="text-blue-500 underline" href="/register">Need to register?</Link>
                </Form>
            </Formik>
        </div>
    );
};