import React from "react";
import { IoMdMail } from "react-icons/io";
import { FaBuilding, FaPhoneVolume } from "react-icons/fa6";

interface AddressSectionProps {
  data?: {
    show?: boolean;
    title?: string;
    description?: string;
    officeAddress?: string;
    email?: string;
    phone?: string;
    mapUrl?: string;
  };
}

export function AddressSection({ data = {} }: AddressSectionProps) {
  // If show is explicitly set to false, hide the section
  if (data.show === false) return null;

  const {
    title,
    description,
    phone = "+1012 3456 789",
    email = "demo@gmail.com",
    officeAddress = "593, Ganesh Peth, Kasturi Chowk, Kolkata 700125",
    mapUrl,
  } = data;

  // Data for the top contact cards
  const contactDetails = [
    {
      title: "For support queries:",
      phone,
      email,
    },
    {
      title: "For partnerships and collaboration:",
      phone,
      email,
    },
    {
      title: "For data protection & legal related inquiries:",
      phone,
      email,
    },
  ];

  const officeLocations = [
    {
      cityAbbr: "Main",
      address: officeAddress,
      number: phone,
      country: "India",
    },
  ];

  return (
    <section className="w-full  py-8">
      <div className="container-xl px-4 sm:px-6 md:px-8 lg:px-10 mx-auto">
        <div className="bg-[#F1F7FF] p-8 rounded-t-md space-y-4">
          {title && (
            <h2 className="text-2xl font-bold text-center text-[#004DAA] mb-4">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-center text-slate-600 mb-8">
              {description}
            </p>
          )}

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {contactDetails.map((contact, index) => (
              <div
                key={index}
                className="space-y-2 rounded-md border border-gray-300  bg-white p-6 shadow-md"
              >
                <h3 className="font-semibold text-[#004DAA]">
                  {contact.title}
                </h3>
                <div className="flex items-center gap-3 text-slate-600">
                  <FaPhoneVolume className="h-5 w-5 text-[#004DAA]" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <IoMdMail className="h-5 w-5 text-[#004DAA]" />
                  <span>{contact.email}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="h-px flex-1 bg-black my-8"></div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x">
            {officeLocations.map((location, index) => (
              <div key={index} className="flex gap-4  p-6">
                <div className="flex-shrink-0 text-center">
                  <div className="inline-flex flex-col items-center justify-center rounded-md bg-white p-3">
                    <FaBuilding className="h-6 w-6 text-slate-600" />
                    <span className="mt-2 text-xs font-bold text-[#004DAA]">
                      {location.cityAbbr}
                    </span>
                  </div>
                </div>

                <div className="flex-grow">
                  <address className="not-italic text-sm text-slate-600">
                    {location.address}
                    <br />
                    <strong>Number:</strong> {location.number}
                    <br />
                    <strong>Country:</strong> {location.country}
                  </address>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Google Map */}
        <div className="overflow-hidden rounded-sm shadow-lg">
          <iframe
            src={
              mapUrl ||
              "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235850.8249198083!2d88.18263595166683!3d22.53542738206126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f882db4908f667%3A0x43e330e68f6c2cbc!2sKolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1727349698000!5m2!1sen!2sin"
            }
            width="100%"
            height="500"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Office Locations Map"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
