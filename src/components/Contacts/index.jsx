import React from "react";
import { MessageCircle, Phone, Mail } from "lucide-react";

// Sample team data with placeholder avatars
const teamMembers = [
  {
    name: "Mudassir Seemab",
    designation: "Visa File Manager",
    phone: "+923348087646",
    email: "mudassir@example.com",
    image: "user1.jpg",
  },
  {
    name: "Noor Ahmed",
    designation: "Managing Director",
    phone: "+923166583461",
    email: "noor@example.com",
    image: "user3.jpg",
  },
  {
    name: "Rana Afaq",
    designation: "Application Team Manager",
    phone: "+923294369840",
    email: "rana@example.com",
    image: "/user2.jpg",
  },
];

const TeamCard = ({ member }) => (
  <div className="bg-white shadow-md rounded-lg p-5 flex flex-col items-center space-y-4 hover:shadow-xl transition">
    <img
      src={member.image}
      alt={member.name}
      className="w-24 h-24 rounded-full object-cover"
    />
    <h2 className="text-lg font-semibold">{member.name}</h2>
    <p className="text-gray-500">{member.designation}</p>
    <div className="flex space-x-3 mt-2">
      <a
        href={`https://wa.me/${member.phone.replace(/\D/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full hover:opacity-90 transition"
      >
        <MessageCircle size={20} />
      </a>
      <a
        href={`tel:${member.phone}`}
        className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full hover:opacity-90 transition"
      >
        <Phone size={20} />
      </a>
      <a
        href={`mailto:${member.email}`}
        className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full hover:opacity-90 transition"
      >
        <Mail size={20} />
      </a>
    </div>
  </div>
);

const TeamSection = () => (
  <section className="py-12 bg-gray-50 w-full">
    <div className="text-center mb-10">
      <h1 className="text-3xl font-bold text-gray-800">Meet Our Team</h1>
      <p className="text-gray-500 mt-2">Our dedicated professionals ready to assist you</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
      {teamMembers.map((member) => (
        <TeamCard key={member.email} member={member} />
      ))}
    </div>
  </section>
);

export default TeamSection;
