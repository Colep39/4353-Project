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
  

      {/* Top section */}
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

        {/* Dark overlay to dim the background */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Hero content on top of background */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-6">
          <h1 className="text-white text-4xl md:text-6xl font-bold">
            Welcome to Cougar Connect
          </h1>
          <p className="text-white text-2xl md:text-3xl font-bold max-w-3xl">
            We network volunteers and event organizers to transform our great community
          </p>

          {/* Example buttons */}
          <div className="flex space-x-4">
            <Link href="/register">
              <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer">
                Join Now
              </button>
            </Link>
            <Link href="/aboutUs">
              <button className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition cursor-pointer">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </div>

     
      <div className="font-sans grid items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
        {/* What we do */}
        <section className="w-full bg-gray-50 py-20 rounded-2xl shadow-lg">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">
            
            
            <div className="bg-white rounded-2xl shadow-lg p-10 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-green-400">
                What We Do
              </h2>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Our mission is to match 
                <span className="font-semibold text-green-400"> energetic volunteers </span> 
                to their best fitting events, connecting people to causes they care about and helping organizers 
                find the support they need to make a difference. This is an amazing opportunity to network with 
                your community and to contribute to something 
                <span className="italic text-green-500"> bigger than yourself</span>.
              </p>
            </div>

            <div className="flex items-center justify-center">
              <Image
                src="/images/harden-volunteering.webp"
                alt="volunteer photo"
                width={500}
                height={500}
                className="rounded-2xl shadow-lg object-cover"
              />
            </div>
          </div>
        </section>
        

        {/* Incentives to join */}
        <div className="max-w-3xl text-center">

        </div>
        
        {/* Reviews */}
        <section className="w-full bg-white py-20 rounded-2xl shadow-lg">
          <div className="max-w-6xl mx-auto px-6 space-y-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-green-400">
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
                  <Image
                    src={review.image}
                    alt={review.name}
                    width={300}
                    height={300}
                    className="rounded-full shadow-lg object-cover"
                  />
                </div>

                {/* Quote bubble */}
                <div className="bg-green-50 rounded-2xl shadow-md p-8 relative">
                  <p className="text-lg md:text-xl text-gray-700 italic mb-4">
                    “{review.quote}”
                  </p>
                  <div className="font-semibold text-green-700">
                    {review.name}
                  </div>
                  <div className="text-gray-500 text-sm">{review.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Footer */}
        <footer className="w-full text-center text-gray-500">
          &copy; {new Date().getFullYear()} Cougar Connect. All rights reserved.
          <div>
            

          </div>
        </footer>
      </div>

    </>
  );
}
