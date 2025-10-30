import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useGetStudentOptionsCountQuery } from "../../features/updates/updateApi";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function ProcessSteps() {
  const [range, setRange] = useState([
    {
      startDate: undefined,
      endDate: undefined,
      key: "selection",
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const queryParams = useMemo(() => {
    const start = range[0]?.startDate ? new Date(range[0].startDate) : undefined;
    const end = range[0]?.endDate ? new Date(range[0].endDate) : undefined;
    return {
      startDate: start ? start.toISOString() : undefined,
      endDate: end ? end.toISOString() : undefined,
      dateField: "createdAt",
    };
  }, [range]);

  const { data, isLoading, error } = useGetStudentOptionsCountQuery(queryParams);

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Failed to load data</p>;

  const counts = data?.data || {};

  const steps = [
    { title: "Clients", icon: <Users className="w-8 h-8 text-blue-600" />, count: counts.clients },
    { title: "Initial Payment", icon: <CreditCard className="w-8 h-8 text-green-600" />, count: counts.initialPayment },
    { title: "Documents", icon: <FileText className="w-8 h-8 text-purple-600" />, count: counts.documents },
    { title: "Applications", icon: <ClipboardCheck className="w-8 h-8 text-orange-600" />, count: counts.applications },
    { title: "Offer Letter Secured", icon: <FileSignature className="w-8 h-8 text-pink-600" />, count: counts.offerLetterSecured },
    { title: "Second Payment", icon: <DollarSign className="w-8 h-8 text-yellow-600" />, count: counts.secondPaymentDone },
    { title: "Visa Appointment", icon: <PlaneTakeoff className="w-8 h-8 text-pink-600" />, count: counts.visaApplication }, // if you have separate "visaAppointment" use that
    { title: "Visa Application", icon: <PlaneTakeoff className="w-8 h-8 text-teal-600" />, count: counts.visaApplication },
    { title: "Visa Secured", icon: <ShieldCheck className="w-8 h-8 text-indigo-600" />, count: counts.visaSecured },
    { title: "Final Payment", icon: <BadgeCheck className="w-8 h-8 text-emerald-600" />, count: counts.finalPayment },
  ];

  return (
    <div className="px-4">
      <div className="mb-4 text-end">
        <div className="relative inline-block" ref={popoverRef}>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm hover:border-gray-300"
            title="Select date range"
            onClick={() => setIsOpen((o) => !o)}
          >
            <span className="font-medium">Date:</span>
            <span className="text-gray-700">
              {range[0]?.startDate && range[0]?.endDate
                ? `${new Date(range[0].startDate).toLocaleDateString()} - ${new Date(range[0].endDate).toLocaleDateString()}`
                : "All time"}
            </span>
          </button>
          {isOpen && (
          <div className="absolute right-0 mt-2 z-150">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-2">
              <DateRange
                ranges={range}
                onChange={(r) => setRange([r.selection])}
                moveRangeOnFirstSelection={false}
                rangeColors={["#2563eb"]}
                editableDateInputs={true}
                showDateDisplay={false}
              />
              <div className="flex justify-end px-1 pb-1">
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => setRange([{ startDate: undefined, endDate: undefined, key: "selection" }])}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col justify-between p-2 bg-white rounded-xl border-2 border-gray-100 shadow-lg transition"
          >
            <div className="flex items-center mb-3">
              <div className="flex items-center justify-center w-auto h-14 px-1">
                {step.icon}
              </div>
              <h3 className="text-base font-semibold">{step.title}</h3>
            </div>
            <p className="text-sm text-gray-600 text-right">{step.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
