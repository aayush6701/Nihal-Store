"use client";

import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaYoutube,
  FaWhatsapp,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaGooglePay,
  FaAmazonPay,
  FaCreditCard,   // substitute for RuPay
  FaUniversity,   // substitute for UPI / Bank
  FaClock,
  FaEnvelope,
  FaPhoneAlt,     // ✅ Correct upright phone icon
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiPaytm } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-[#e0f5f1] text-gray-800">
      {/* ✅ Top bar */}
      <div className="bg-[#1aa398] text-white text-base md:text-md py-4 px-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap flex-col sm:flex-row 
                items-start sm:items-center justify-start md:justify-between 
                gap-3 sm:gap-6 md:gap-8 text-left">

  <span className="font-semibold text-base md:text-md">Need help?</span>

  <span className="flex items-center gap-3">
    <FaClock className="text-xl" />
    Working Days: Mon to Sat
  </span>

  <span className="flex items-center gap-3">
    <FaEnvelope className="text-xl" />
    Email: nihalcollections@gmail.in
  </span>

  <span className="flex items-center gap-3">
    <FaPhoneAlt className="text-xl" />
    Phone / WhatsApp: 9516335000
  </span>
</div>

      </div>

      
      {/* Main footer */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 
                grid md:grid-cols-4 gap-10 text-left">

  {/* Newsletter (spans 2 cols on desktop) */}
  <div className="md:col-span-2">
    <h3 className="font-semibold text-lg mb-2">Newsletter</h3>
    <p className="text-sm mb-4">
      Get all the latest information on Events, Sales and Offers. 
      Sign up for newsletter today.
    </p>
    <div className="flex">
      <input
        type="email"
        placeholder="Enter your email"
        className="flex-grow px-4 py-3 rounded-l-md border border-gray-300 focus:outline-none text-base"
      />
      <button className="bg-white border border-gray-300 px-5 rounded-r-md text-lg">
        ➝
      </button>
    </div>
  </div>

  {/* Policy */}
  <div>
    <h3 className="font-semibold text-lg mb-2">Policy</h3>
    <ul className="space-y-2 text-base">
      <li><a href="#">Terms & Conditions</a></li>
      <li><a href="#">Privacy Policy</a></li>
      <li><a href="#">Shipping Policy</a></li>
      <li><a href="#">Cancellation & Refund</a></li>
    </ul>
  </div>

  {/* Store Info */}
  <div>
    <h3 className="font-semibold text-lg mb-2">Store Info</h3>
    <ul className="space-y-2 text-base">
      <li><a href="#">About Us</a></li>
      <li><a href="#">Our Blog</a></li>
      <li><a href="#">Offers</a></li>
      <li><a href="#">Download App Now!</a></li>
      <li><a href="#">Trust and Safety</a></li>
      <li><a href="#">Track Your Order</a></li>
      <li><a href="#">Contact us</a></li>
    </ul>
  </div>
</div>

      {/* Bottom bar */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 
                flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left */}
        <p className="text-sm md:text-base text-gray-600">
          © Nihal Store <br />
          Proudly Made in India
        </p>

        {/* Social icons */}
        <div className="flex items-center gap-5 text-2xl">
          <FaFacebookF />
          <FaXTwitter />
          <FaPinterestP />
          <FaInstagram />
          <FaYoutube />
          <FaWhatsapp className="text-green-500" />
        </div>

        {/* Payment icons */}
        <div className="flex flex-wrap gap-4 text-4xl">
          <FaCcVisa className="text-blue-600" />
          <FaCcMastercard className="text-red-600" />
          <FaCcPaypal className="text-blue-500" />
          <FaCreditCard className="text-indigo-600" />   {/* RuPay substitute */}
          <SiPaytm className="text-sky-500" />
          <FaGooglePay className="text-green-600" />
          <FaAmazonPay className="text-yellow-600" />
          <FaUniversity className="text-gray-800" />     {/* UPI substitute */}
        </div>
      </div>
    </footer>
  );
}
