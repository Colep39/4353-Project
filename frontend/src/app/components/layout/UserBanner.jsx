function UserBanner({ user, children }) {
  return (
    <div className="bg-green-200 min-h-screen">
      <div className="flex items-center justify-between h-[5vh] bg-green-800 text-white px-4 font-sans">
        <div className="flex items-center">
          <img src="/images/avatars/cougar-connect-logo.jpg" alt="Cougar Connect Logo" className="w-20 h-20 rounded-full object-cover mr-5"/>
          <span className="text-lg font-semibold">The Cougar Connect</span>
        </div>
        <div className="flex items-center text-lg font-semibold">
          <span className="mr-2">Welcome, {user?.fullName || "User"}</span>
          {user?.avatar && (
            <img src={user.avatar} alt={user?.fullName} className="ml-2 w-8 h-8 rounded-full object-cover"/>)}
        </div>
      </div>

      {children}
    </div>
  );
}

export default UserBanner;
