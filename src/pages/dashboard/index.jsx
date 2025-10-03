import React, { useMemo } from "react";
import UpdatedSection from "../../components/UpdatedSection";
import QRSection from "../../components/QRSection"
import AdminMessage from "../../components/AdminMessages";

const Index = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

const quotes = [
  "Choose a job you love, and you will never have to work a day in your life.",
  "Your work is going to fill a large part of your life, make it meaningful.",
  "Don’t be busy, be productive.",
  "Strive not to be a success, but rather to be of value.",
  "Opportunities don’t happen, you create them.",
  "Do what you can, with what you have, where you are.",
  "If you want to achieve greatness, stop asking for permission.",
  "Hard work beats talent when talent doesn’t work hard.",
  "The future depends on what you do today.",
  "Don’t limit your challenges. Challenge your limits.",
  "Every job is a self-portrait of the person who does it. Autograph your work with excellence.",
  "The only way to achieve the impossible is to believe it is possible.",
  "Good things come to people who wait, but better things come to those who go out and get them.",
  "If you want to go fast, go alone. If you want to go far, go together.",
  "Stay positive, work hard, and make it happen.",
  "Your career is your responsibility. Own it.",
  "Don’t wish for it, work for it.",
  "Professionalism means doing your job well even when you don’t feel like it.",
  "Work hard in silence, let your success make the noise.",
  "Success is liking yourself, liking what you do, and liking how you do it.",
];


  const randomQuote = useMemo(() => {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []);

  return (
    <div className="h-full w-full flex flex-col gap-5">
      <div className="flex flex-col w-full items-start justify-center text-center my-6">
        <h1 className="text-2xl font-bold">{getGreeting()} 👋</h1>
        <p className="mt-2 text-lg italic text-start text-gray-700 max-w-xl">"{randomQuote}"</p>
      </div>

      <div className="flex h-auto w-full items-center justify-center text-xl font-bold">
        <UpdatedSection />
      </div>

      <div className="flex w-full px-4">
        <QRSection />
      </div>

      <div className="flex w-full px-4">
        <AdminMessage />
      </div>
    </div>
  );
};

export default Index;
