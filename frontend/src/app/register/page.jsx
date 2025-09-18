"use client";
import { ErrorMessage, Formik, Field, Form } from 'formik';

const validateFields = (values) => {
    const errors = {};

    if (!values.userType) {
        errors.userType = "Please select a User Type";
    }

    if (!values.username) {
        errors.username = "Username is required";
    };

    if (!values.password) {
        errors.password = "Password is required";
    };

    return errors;
}

export default function RegisterPage() {
    return (
        <div className="p-6 max-w-md mx-auto min-h-screen">
            <Formik
                initialValues={{
                    userType: "",
                    username: "",
                    password: ""
                }}

                onSubmit={(values) => {
                    alert(`Submitted:\n${JSON.stringify(values, null, 2)}`);
                    // insert api call to save
                }}

                validate={validateFields}
            >
                <Form className="bg-white border p-4 rounded flex flex-col gap-4">
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
                            Username
                        </label>
                        <Field
                            className="border px-3 py-2 rounded"
                            id="username"
                            name="username"
                            placeholder="Username"
                        />
                        <ErrorMessage
                            name="username"
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