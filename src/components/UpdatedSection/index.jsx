// src/components/ProcessSteps.jsx
import React from "react";
import {
  Users,
  CreditCard,
  FileText,
  ClipboardCheck,
  FileSignature,
  DollarSign,
  PlaneTakeoff,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

const steps = [
  { title: "Clients", icon: <Users className="w-8 h-8 text-blue-600" />, count: 120 },
  { title: "Initial Payment", icon: <CreditCard className="w-8 h-8 text-green-600" />, count: 95 },
  { title: "Documents", icon: <FileText className="w-8 h-8 text-purple-600" />, count: 85 },
  { title: "Applications", icon: <ClipboardCheck className="w-8 h-8 text-orange-600" />, count: 72 },
  { title: "Offer Letter Secured", icon: <FileSignature className="w-8 h-8 text-pink-600" />, count: 60 },
  { title: "Second Payment", icon: <DollarSign className="w-8 h-8 text-yellow-600" />, count: 58 },
  { title: "Visa Appointment", icon: <PlaneTakeoff className="w-8 h-8 text-pink-600" />, count: 49 },
  { title: "Visa Application", icon: <PlaneTakeoff className="w-8 h-8 text-teal-600" />, count: 50 },
  { title: "Visa Secured", icon: <ShieldCheck className="w-8 h-8 text-indigo-600" />, count: 48 },
  { title: "Final Payment", icon: <BadgeCheck className="w-8 h-8 text-emerald-600" />, count: 45 },
];

export default function ProcessSteps() {
  return (
    <div className=" px-4 ">
      {/* <h2 className="text-2xl font-bold text-center mb-8">Our Process</h2> */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col justify-between p-2 bg-white rounded-xl border-2 border-gray-100 shadow-lg transition"
          >
            {/* Icon + Title Row */}
            <div className="flex items-center mb-3">
              <div className="flex items-center justify-center w-auto h-14 px-1">
                {step.icon}
              </div>
              <h3 className="text-base font-semibold">{step.title}</h3>
            </div>

            {/* Count */}
            <p className="text-sm text-gray-600 text-right">{step.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
