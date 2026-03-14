"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  CheckSquare, 
  ArrowRight, 
  Shield, 
  Zap, 
  Layout, 
  Users, 
  BarChart3, 
  CheckCircle,
  Play
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-primary-100 selection:text-primary-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
              <CheckSquare className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">TaskMind</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">Features</a>
            <a href="#solutions" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">Solutions</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">Pricing</a>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="px-5 py-2.5 font-semibold text-slate-600 hover:text-slate-900 transition-colors text-sm">
              Log in
            </Link>
            <Link href="/register" className="btn-primary py-2.5 px-6 shadow-md shadow-primary-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-gradient-to-b from-primary-50/50 to-transparent -z-10 rounded-[100%] blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider">
              <Zap className="h-3 w-3" /> The Future of Productivity is Here
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Work smarter. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">Scale faster.</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
              The only role-based productivity suite designed for high-performance teams. 
              Manage tasks, track velocity, and align your team in a single, beautiful workspace.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="btn-primary px-8 py-4 text-lg flex items-center gap-3 group shadow-xl shadow-primary-200">
                Start Your Trial <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 text-lg font-bold text-slate-700 hover:bg-white rounded-xl transition-all border border-slate-200 hover:shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Play className="h-4 w-4 text-primary-600 ml-0.5" />
                </div>
                See in Action
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium italic">
                Joined by <span className="text-slate-900 font-bold">2,000+</span> teams this month
              </p>
            </div>
          </div>

          <div className="relative animate-slide-up delay-200 hidden lg:block">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-slate-300 border border-slate-100 scale-105 hover:scale-110 transition-transform duration-700">
              <img 
                src="C:\Users\ASHROCK\.gemini\antigravity\brain\f921d1f5-b4da-439f-8540-e610d46adac8\productivity_hero_mockup_1773512726306.png" 
                alt="Productivity Dashboard Mockup" 
                className="w-full h-auto"
              />
            </div>
            {/* Floaties */}
            <div className="absolute -top-10 -right-10 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce delay-700 z-20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-slate-700">Team Velocity +24%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 bg-white border-y border-slate-100 overflow-hidden">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">Trusted by industry leaders</p>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 lg:gap-24 opacity-40 grayscale group hover:grayscale-0 transition-all duration-500 items-center">
           {['GlobalTech', 'InnovateX', 'NextSys', 'Visionary', 'Quantum'].map(name => (
             <span key={name} className="text-2xl font-black text-slate-800 tracking-tighter italic">{name}</span>
           ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Everything you need to <span className="text-primary-600 text-underline-premium">dominate</span> your workflow.</h2>
            <p className="text-slate-600">Powerful features built for every role, from individual contributors to system administrators.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { 
                title: "Granular RBAC", 
                desc: "Custom permissions for Admins, Managers, and Users. No data leaks, total control.", 
                icon: Shield,
                bg: "bg-primary-50",
                text: "text-primary-600"
              },
              { 
                title: "Velocity Analytics", 
                desc: "Track team throughput with interactive Recharts. Identify bottlenecks before they happen.", 
                icon: BarChart3,
                bg: "bg-emerald-50",
                text: "text-emerald-600"
              },
              { 
                title: "Task Intelligence", 
                desc: "Smart priority scoring and deadline tracking. Never miss a critical milestone again.", 
                icon: Zap,
                bg: "bg-amber-50",
                text: "text-amber-600"
              },
            ].map((feature, i) => (
              <div key={i} className="card-premium p-8 group hover:translate-y-[-8px] transition-all duration-300">
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-8 w-8 ${feature.text}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                <div className="pt-6">
                   <button className="text-sm font-bold text-primary-600 flex items-center gap-2 group-hover:gap-3 transition-all">
                     Learn more <ArrowRight className="h-4 w-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase 1 */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-100 rounded-full blur-3xl opacity-60"></div>
             <img 
               src="C:\Users\ASHROCK\.gemini\antigravity\brain\f921d1f5-b4da-439f-8540-e610d46adac8\analytics_feature_mockup_1773512809180.png" 
               alt="Analytics Dashboard" 
               className="relative z-10 rounded-2xl shadow-xl border border-slate-100"
             />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Real-time Analytics at <br /> your fingertips.</h2>
            <p className="text-lg text-slate-600">
              Managers can track team velocity with precision. Our integrated analytics engine aggregates task data across your entire organization to give you a bird's-eye view of productivity trends.
            </p>
            <ul className="space-y-3">
              {[
                "Interactive Recharts integration",
                "Historical performance tracking",
                "Automated bottleneck detection",
                "Exportable reports for stakeholders"
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Showcase 2 */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-6 order-2 lg:order-1">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Collaboration without <br /> the noise.</h2>
            <p className="text-lg text-slate-600">
              Connect your team with role-based mission control. Users focus on their tasks, Managers oversee the pipeline, and Admins maintain system integrity. No distractions, just delivery.
            </p>
            <ul className="space-y-3">
              {[
                "Role-specific dashboard sub-routes",
                "Integrated secure Auth flow",
                "Collaborative task assignment",
                "Mobile-responsive management tools"
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative order-1 lg:order-2">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-100 rounded-full blur-3xl opacity-60"></div>
             <img 
               src="C:\Users\ASHROCK\.gemini\antigravity\brain\f921d1f5-b4da-439f-8540-e610d46adac8\collaboration_feature_mockup_1773512826452.png" 
               alt="Team Collaboration" 
               className="relative z-10 rounded-2xl shadow-xl border border-slate-100"
             />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-40 bg-white">
        <div className="max-w-5xl mx-auto px-6 rounded-[3rem] bg-slate-900 py-20 px-10 text-center relative overflow-hidden shadow-2xl shadow-primary-900/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Ready to transform how your team <br /> handles productivity?</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Join thousands of teams already scaling with TaskMind. Start for free today, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/register" className="btn-primary bg-white text-slate-900 hover:bg-slate-100 px-10 py-5 text-xl">
                Get Started for Free
              </Link>
              <Link href="/login" className="px-10 py-5 text-xl font-bold text-white hover:bg-white/10 rounded-2xl transition-all border border-white/20">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="text-white h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">TaskMind</span>
            </div>
            <p className="text-slate-500 max-w-xs leading-relaxed">
              Empowering teams to reach their maximum potential through intelligent task management and role-based alignment.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary-600 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Enterprise</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Security</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Community</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-primary-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <p>&copy; 2024 TaskMind Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
