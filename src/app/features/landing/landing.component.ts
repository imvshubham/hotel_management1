import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand-blue/10 selection:text-brand-blue overflow-x-hidden">
      
      <!-- Sticky Translucent Navbar -->
      <nav class="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100 h-16 flex items-center justify-between px-6 md:px-12 transition-all">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded bg-brand-dark flex items-center justify-center text-white font-black text-sm">H</div>
          <div>
            <h1 class="text-sm font-black tracking-tight text-brand-dark">The Shivalik</h1>
            <p class="text-[9px] tracking-widest uppercase font-mono text-slate-400">Grand Hotel</p>
          </div>
        </a>

        <!-- CTAs -->
        <div class="flex items-center gap-3">
          <a 
            routerLink="/auth/login" 
            class="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors"
          >
            Sign In
          </a>
          <a 
            routerLink="/auth/register" 
            class="px-4 py-2 bg-slate-950 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold shadow-premium transition-all hover:scale-[1.02]"
          >
            Create Account
          </a>
        </div>
      </nav>

      <!-- HERO SECTION -->
      <header class="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <!-- Background Abstract Gradient Shape -->
        <div class="absolute -top-12 -left-20 w-72 h-72 rounded-full bg-brand-blue/5 blur-3xl -z-10 animate-pulse duration-[6000ms]"></div>
        <div class="absolute top-1/2 right-10 w-96 h-96 rounded-full bg-slate-100 blur-3xl -z-10"></div>

        <!-- Hero text (left column - 6 cols) -->
        <div class="lg:col-span-6 space-y-6">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xxs font-bold text-brand-blue uppercase tracking-wider font-mono">
            <span>✨</span> Now Live: Indian Stays Redefined
          </div>
          
          <h2 class="text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight">
            Luxury stays <br/>
            <span class="text-brand-blue">made effortless.</span>
          </h2>
          
          <p class="text-sm md:text-base text-slate-500 max-w-lg leading-relaxed">
            Experience the next standard of hospitality. The Shivalik fuses premium SaaS dashboard controls with five-star luxury suites. Track bookings, customize room options, and process invoices instantly.
          </p>

          <div class="flex flex-wrap gap-3 pt-2">
            <a 
              routerLink="/auth/register" 
              class="px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs font-bold shadow-premium transition-all hover:scale-[1.02]"
            >
              Book Stay Now
            </a>
            <a 
              routerLink="/auth/login" 
              class="px-6 py-3 border border-slate-200 text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
            >
              Access Portal
            </a>
          </div>
        </div>

        <!-- Hero Mockup (right column - 6 cols) -->
        <div class="lg:col-span-6 relative flex justify-center items-center">
          <!-- Geometric Background Grid -->
          <div class="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] -z-10 opacity-60"></div>
          
          <!-- Mockup Container -->
          <div class="relative w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-premium-lg p-6 space-y-6 glass-panel">
            
            <!-- Dashboard Mock Header -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-brand-blue"></div>
                <span class="text-xxs font-mono font-bold uppercase tracking-wider text-slate-400">Live Status Room 103</span>
              </div>
              <span class="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">VACANT</span>
            </div>

            <!-- Dashboard Mini Graph/Stat Mock -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                <p class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Occupancy Rate</p>
                <p class="text-lg font-bold text-slate-900 font-mono">87.5%</p>
              </div>
              <div class="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                <p class="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Today's Revenue</p>
                <p class="text-lg font-bold text-brand-blue font-mono">₹4.8 Lakhs</p>
              </div>
            </div>

            <!-- Floating Mini Card (In-app Booking Mock) -->
            <div class="border border-slate-100 rounded-xl p-4 bg-white shadow-premium flex items-center justify-between">
              <div>
                <p class="text-xxs text-slate-400 font-bold uppercase tracking-wider">Awaiting Check-in</p>
                <p class="text-xs font-semibold text-slate-900 mt-0.5">Rohan Mehta (Suite 204)</p>
              </div>
              <div class="w-8 h-8 rounded bg-slate-950 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>

          </div>

          <!-- Abstract floating element: Glass checkmark -->
          <div class="absolute -bottom-4 -left-6 bg-white border border-slate-100 shadow-premium p-3 rounded-xl flex items-center gap-2 max-w-xs animate-bounce duration-[3000ms]">
            <div class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs shrink-0 font-bold">✓</div>
            <span class="text-xxs text-slate-500 font-medium">Checkout paid: INV-4411</span>
          </div>

        </div>
      </header>

      <!-- FEATURES SECTION -->
      <section class="py-20 border-t border-slate-50 bg-slate-50/40">
        <div class="max-w-7xl mx-auto px-6 md:px-12">
          
          <div class="max-w-xl mx-auto text-center mb-16 space-y-2">
            <h3 class="text-xs font-mono uppercase tracking-widest text-brand-blue font-bold">Intuitive Control</h3>
            <h2 class="text-2xl md:text-3xl font-black tracking-tight text-slate-950">
              Modern microservice features.
            </h2>
            <p class="text-xs md:text-sm text-slate-500 leading-relaxed">
              Every detail is engineered to provide frictionless management for hoteliers and seamless bookings for guests.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Feature 1 -->
            <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4 hover:border-slate-200 transition-all">
              <div class="w-10 h-10 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-slate-900">Contactless Booking</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Specify stay duration, select room preferences, and secure bookings immediately with real-time rate calculator.
              </p>
            </div>

            <!-- Feature 2 -->
            <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4 hover:border-slate-200 transition-all">
              <div class="w-10 h-10 rounded-lg bg-slate-950/10 text-slate-950 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-slate-900">Room Clean States</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Housekeeping grid to monitor clean, occupied, and maintenance categories. Change status inline instantly.
              </p>
            </div>

            <!-- Feature 3 -->
            <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4 hover:border-slate-200 transition-all">
              <div class="w-10 h-10 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-slate-900">Digital Invoicing</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Generate dynamic invoices, review charges breakdowns, and export professional billing text sheets.
              </p>
            </div>

            <!-- Feature 4 -->
            <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4 hover:border-slate-200 transition-all">
              <div class="w-10 h-10 rounded-lg bg-slate-950/10 text-slate-950 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-slate-900">Incident Help Desk</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Guests can submit incident categories directly from rooms. Staff can mark issues as resolved inline.
              </p>
            </div>
          </div>

        </div>
      </section>

      <!-- WHY CHOOSE US -->
      <section class="py-20 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div class="lg:col-span-5 space-y-6">
          <h3 class="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Standard of Excellence</h3>
          <h2 class="text-3xl font-black tracking-tight text-slate-950 leading-tight">
            Designed for premium SaaS performance.
          </h2>
          <p class="text-xs md:text-sm text-slate-500 leading-relaxed">
            The Shivalik represents a shift from archaic hotel interfaces to robust, responsive dashboards. Experience rapid rendering, secured validations, and accessible navigation hooks built on clean technology.
          </p>
          
          <ul class="space-y-3.5 text-xs text-slate-700 font-medium">
            <li class="flex items-center gap-2">
              <span class="text-brand-blue font-bold">✓</span> Strictly validated inputs (regex checkouts & password matrices)
            </li>
            <li class="flex items-center gap-2">
              <span class="text-brand-blue font-bold">✓</span> Persistent local storage mocks for instant demonstration
            </li>
            <li class="flex items-center gap-2">
              <span class="text-brand-blue font-bold">✓</span> Clean standalone components routing shell
            </li>
          </ul>
        </div>

        <div class="lg:col-span-7 bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-brand-blue/5 blur-xl"></div>
          
          <!-- Mock Table snippet -->
          <div class="space-y-3">
            <p class="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Sample Stay Logs</p>
            
            <div class="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-premium">
              <table class="w-full text-left text-xxs font-mono">
                <tr class="bg-slate-50/70 border-b border-slate-100 text-slate-400">
                  <th class="py-2.5 px-3">GUEST</th>
                  <th class="py-2.5 px-3">CHECK-IN</th>
                  <th class="py-2.5 px-3">ROOM</th>
                  <th class="py-2.5 px-3">STATUS</th>
                </tr>
                <tr class="border-b border-slate-50">
                  <td class="py-3 px-3 font-bold">Aarav Sharma</td>
                  <td class="py-3 px-3">2026-06-01</td>
                  <td class="py-3 px-3">Room 103</td>
                  <td class="py-3 px-3 text-emerald-600">APPROVED</td>
                </tr>
                <tr>
                  <td class="py-3 px-3 font-bold">Priya Patel</td>
                  <td class="py-3 px-3">2026-06-12</td>
                  <td class="py-3 px-3">--</td>
                  <td class="py-3 px-3 text-yellow-600">PENDING</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

      </section>

      <!-- STATISTICS SECTION -->
      <section class="py-16 bg-slate-950 text-white text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        
        <div class="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p class="text-3xl md:text-4xl font-mono font-black text-brand-blue">98.4%</p>
            <p class="text-xs uppercase tracking-widest font-mono text-slate-400 font-bold mt-1">Guest Satisfaction Rating</p>
          </div>
          <div>
            <p class="text-3xl md:text-4xl font-mono font-black text-white">140+</p>
            <p class="text-xs uppercase tracking-widest font-mono text-slate-400 font-bold mt-1">Luxury Suites in Gandhinagar</p>
          </div>
          <div>
            <p class="text-3xl md:text-4xl font-mono font-black text-brand-blue">1.2M+</p>
            <p class="text-xs uppercase tracking-widest font-mono text-slate-400 font-bold mt-1">Stays Managed Internationally</p>
          </div>
        </div>
      </section>

      <!-- TESTIMONIALS -->
      <section class="py-20 max-w-7xl mx-auto px-6 md:px-12">
        
        <div class="max-w-xl mx-auto text-center mb-16 space-y-2">
          <h3 class="text-xs font-mono uppercase tracking-widest text-brand-blue font-bold">Guest Experiences</h3>
          <h2 class="text-2xl md:text-3xl font-black tracking-tight text-slate-950">
            Endorsed by corporate guests.
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Card 1 -->
          <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4">
            <p class="text-xs text-slate-500 leading-relaxed italic">
              "The digital billing was transparent and quick. Checking in, selecting my room preference, and processing the card checkout took less than 2 minutes."
            </p>
            <div>
              <p class="text-xs font-bold text-slate-900">Rohan Mehta</p>
              <p class="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-semibold mt-0.5">Corporate Guest</p>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4">
            <p class="text-xs text-slate-500 leading-relaxed italic">
              "Filing support requests directly from the room dashboard is a game changer. I reported a minor AC issue, and the housekeeping team resolved it inline within minutes."
            </p>
            <div>
              <p class="text-xs font-bold text-slate-900">Priya Patel</p>
              <p class="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-semibold mt-0.5">Executive Traveler</p>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4">
            <p class="text-xs text-slate-500 leading-relaxed italic">
              "Absolutely love the minimal, elegant dark accents and responsive interface. The system behaves exactly like a premium SaaS dashboard."
            </p>
            <div>
              <p class="text-xs font-bold text-slate-900">Sneha Verma</p>
              <p class="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-semibold mt-0.5">Frequent Visitor</p>
            </div>
          </div>
        </div>

      </section>

      <!-- CTA SECTION -->
      <section class="py-20 max-w-5xl mx-auto px-6 text-center space-y-8">
        <h2 class="text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">
          Experience the standard of <br/>
          contactless hospitality.
        </h2>
        <p class="text-xs md:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Book your reservation or access the dashboard portal instantly. Start your contactless hotel stay with The Shivalik today.
        </p>

        <div class="flex justify-center gap-3">
          <a 
            routerLink="/auth/register" 
            class="px-6 py-3 bg-slate-950 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] shadow-premium"
          >
            Create Customer Account
          </a>
          <a 
            routerLink="/auth/login" 
            class="px-6 py-3 border border-slate-200 text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
          >
            Sign In
          </a>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="py-12 border-t border-slate-100 bg-slate-50/50">
        <div class="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded bg-brand-dark flex items-center justify-center text-white font-black text-xs">H</div>
            <span class="text-xs font-bold tracking-tight text-brand-dark">The Shivalik</span>
          </div>

          <p class="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
            © 2026 The Shivalik Residences. Gandhinagar, Gujarat. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  `
})
export class LandingComponent {}
