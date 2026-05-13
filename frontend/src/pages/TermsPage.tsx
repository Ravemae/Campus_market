import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-20">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest mb-6 border-2 border-orange-200">
             Legal Information
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]">
            Terms of <br/>
            <span className="text-orange-600">Service.</span>
          </h1>
          <p className="text-slate-500 font-bold mt-8 text-lg max-w-xl">
            Please read these terms carefully before using our platform. By using QuickMart, you agree to these conditions.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">1. Introduction</h2>
            <div className="h-1 w-20 bg-orange-600 mb-6 rounded-full"></div>
            <p className="text-slate-600 font-medium leading-relaxed">
              Welcome to QuickMart. These Terms of Service govern your use of our marketplace and logistics platform. 
              Our service connects university students with local vendors for fast delivery and pickup services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">2. User Accounts</h2>
            <div className="h-1 w-20 bg-orange-600 mb-6 rounded-full"></div>
            <p className="text-slate-600 font-medium leading-relaxed">
              When you create an account (via email or Google), you must provide accurate and complete information. 
              You are responsible for maintaining the confidentiality of your account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">3. Vendor Policies</h2>
            <div className="h-1 w-20 bg-orange-600 mb-6 rounded-full"></div>
            <p className="text-slate-600 font-medium leading-relaxed">
              Vendors must be approved before selling on the platform. All products listed must be accurate in description 
              and available for delivery or pickup as stated. QuickMart reserves the right to remove any vendor or product 
              that violates our community standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">4. Delivery & Fees</h2>
            <div className="h-1 w-20 bg-orange-600 mb-6 rounded-full"></div>
            <p className="text-slate-600 font-medium leading-relaxed">
              Delivery times are estimates and may vary based on campus conditions. Service fees and delivery charges 
              are displayed at checkout and are non-refundable once an order is processed.
            </p>
          </section>

          <section className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
             <p className="text-sm text-slate-500 font-bold italic">
               Last updated: May 13, 2026. For questions regarding these terms, please contact us at quickmart.apps@gmail.com
             </p>
          </section>
        </div>

        <div className="mt-20">
           <Link 
             to="/" 
             className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/20"
           >
             Back to Home
           </Link>
        </div>
      </div>
    </div>
  );
}
