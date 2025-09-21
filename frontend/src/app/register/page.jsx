"use client";
import { ErrorMessage, Formik, Field, Form } from 'formik';

const validateFields = (values) => {
    const errors = {};

    if (!values.userType) {
        errors.userType = "Please select a User Type";
    }

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
            className="flex items-start justify-center min-h-screen bg-cover bg-center p-6 pt-40"
            style={{ backgroundImage: "url('/images/login-bg.png')" }}
        >
            <Formik
                initialValues={{
                    userType: "",
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
                    <p className="text-lg font-semibold text-center">Welcome! Please register below.</p>

                    <p className="font-medium">Select User Type</p>
                    <div className="border p-3 rounded">
                        <label className="mr-4 flex items-center gap-2">
                            <Field
                                type="radio"
                                name="userType"
                                value="volunteer"
                            />
                            Volunteer
                        </label>
                        <label className='mr-4 flex items-center gap-2'>
                            <Field
                                type="radio"
                                name="userType"
                                value="admin"
                            />
                            Administrator
                        </label>
                    </div>
                    <ErrorMessage
                        name="userType"
                        component="div"
                        className="text-red-500 text-sm"
                    />

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
                        Register
                    </button>
                </Form>
            </Formik>
        </div>
    );
};