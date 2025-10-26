import Image from 'next/image';
import Link from 'next/link';

const reviews = [
  {
    name: "James Harden",
    role: "Volunteer",
    quote:
      "Cougar Connect made it so easy to find events that matched my passion. I’ve met so many amazing people along the way!",
    image: "/images/harden-review.webp",
  },
  {
    name: "Ian Hawke",
    role: "Event Organizer",
    quote:
      "Finding reliable volunteers used to be so hard. Now I can focus on making my events impactful, knowing I’ll have the support I need.",
    image: "/images/ian.webp",
  },
  {
    name: "Santiago Segovia",
    role: "Volunteer",
    quote:
      "I love how simple it is to connect with causes that matter to me. Cougar Connect has helped me give back in meaningful ways.",
    image: "/images/santiago.jpeg",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div
        className="relative w-full"
        style={{ height: "calc(100vh - 64px)" }} // 64px = navbar height
      >
        {/* Background image */}
        <Image
          src="/images/cougar-group-photo.jpg"
          alt="group photo"
          fill
          priority
          className="object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-6 px-4">
          <h1 className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-lg">
            Welcome to Cougar Connect
          </h1>
          <p className="text-white text-xl md:text-2xl max-w-3xl font-medium drop-shadow-md">
            We connect volunteers and event organizers to transform our community — one cause at a time.
          </p>

          <div className="flex space-x-4 mt-4">
            <Link href="/register">
              <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition transform hover:scale-105 cursor-pointer">
                Join Now
              </button>
            </Link>
            <Link href="/aboutUs">
              <button className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition transform hover:scale-105 cursor-pointer">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="font-sans grid items-center justify-items-center p-8 pb-0 gap-16 sm:p-20 bg-white">

        {/* What We Do Section */}
        <section className="w-full bg-white py-20 rounded-2xl shadow-xl">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">
            <div className="order-2 md:order-1 text-center md:text-left space-y-6">
              <h2 className="text-4xl md:text-5xl font-extrabold text-red-300">
                What We Do
              </h2>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Our mission is to connect
                <span className="font-semibold text-red-500"> energetic volunteers </span>
                to events that inspire them. We help event organizers find
                dedicated support so they can make a bigger impact. Together, we’re
                building a stronger, more connected community.
              </p>
            </div>

            <div className="order-1 md:order-2 flex items-center justify-center">
              <Image
                src="/images/harden-volunteering.webp"
                alt="volunteering"
                width={500}
                height={500}
                className="rounded-2xl shadow-2xl object-cover"
              />
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="w-full bg-white py-20 rounded-2xl shadow-xl">
          <div className="max-w-6xl mx-auto px-6 space-y-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-red-300">
              What People Are Saying
            </h2>

            {reviews.map((review, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Image */}
                <div className="flex justify-center">
                  <div className="w-60 h-60 rounded-full overflow-hidden shadow-lg border-4 border-red-200">
                    <Image
                      src={review.image}
                      alt={review.name}
                      width={240}
                      height={240}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                {/* Quote */}
                <div className="bg-red-100 rounded-2xl shadow-md p-8 relative">
                  <p className="text-lg md:text-xl text-gray-700 italic mb-4">
                    “{review.quote}”
                  </p>
                  <div className="font-semibold text-red-700">{review.name}</div>
                  <div className="text-gray-500 text-sm">{review.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-gray-300 py-12 mt-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 px-8">
          {/* About */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">About Cougar Connect</h3>
            <p className="text-sm leading-relaxed">
              Cougar Connect bridges the gap between passionate volunteers and local organizers,
              empowering communities through collaboration and shared purpose.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/events" className="hover:text-red-400 transition">Events</Link></li>
              <li><Link href="/eventManagement" className="hover:text-red-400 transition">Manage Events</Link></li>
              <li><Link href="/volunteerHistory" className="hover:text-red-400 transition">Volunteer History</Link></li>
              <li><Link href="/aboutUs" className="hover:text-redd-400 transition">About Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Contact Us</h3>
            <p className="text-sm">123 Cougar Lane, Houston, TX 77004</p>
            <p className="text-sm mt-2">Email: info@cougarconnect.org</p>
            <p className="text-sm">Phone: (713) 555-1234</p>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-red-400 transition">Facebook</a>
              <a href="#" className="hover:text-red-400 transition">Instagram</a>
              <a href="#" className="hover:text-red-400 transition">LinkedIn</a>
              <a href="#" className="hover:text-red-400 transition">Twitter</a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 text-center pt-6 text-sm text-gray-500">
          © {new Date().getFullYear()} Cougar Connect. All rights reserved.
        </div>
      </footer>
    </>
  );
}
