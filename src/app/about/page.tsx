import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import {
  Code,
  Sparkles,
  Terminal,
  Zap,
  GraduationCap,
  Award,
  Mail,
  Phone,
  Github,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Layers,
  HeartHandshake,
  Briefcase,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About — Komal Maurya | Full-Stack Web Developer",
  description:
    "Learn about Komal Maurya, a full-stack web developer and Computer Science student from Mumbai specializing in React, Node.js, Express, MongoDB, and modern web applications.",
};

const EDUCATION = [
  {
    degree: "Bachelor of Science in Computer Science (B.Sc CS)",
    institution: "University of Mumbai",
    period: "Jul 2023 — Jun 2026",
    score: "8.53 CGPA",
    desc: "Core focus on Full-Stack Web Development, Data Structures, Database Management Systems, and Software Engineering principles.",
  },
  {
    degree: "Higher Secondary School Certificate (HSC)",
    institution: "Abhinav Junior College, Bhayandar",
    period: "Completed Jun 2022",
    score: "66.33%",
    desc: "Completed science and technology curriculum with foundational mathematics and computer applications.",
  },
  {
    degree: "Secondary School Certificate (SSC)",
    institution: "Maa Bharti Hindi High School, Bhayandar",
    period: "Completed Jun 2020",
    score: "86.60%",
    desc: "High school graduation with distinction, active participation in science exhibitions and academic competitions.",
  },
];

const CERTIFICATIONS = [
  {
    title: "Basics of Python",
    issuer: "Infosys",
    desc: "Fundamentals of Python programming, control flow, functions, and data structures.",
  },
  {
    title: "MSC-IT Certification",
    issuer: "MS Office & IT Literacy",
    desc: "Comprehensive IT concepts, office automation, productivity workflows, and computer operations.",
  },
  {
    title: "Cybersecurity Job Simulation",
    issuer: "Industry Practical Simulation",
    desc: "Certificate of Completion covering network defense principles, security best practices, and threat analysis.",
  },
  {
    title: "Data Labeling Job Simulation",
    issuer: "AI / Data Practical Simulation",
    desc: "Certificate of Completion in structuring, tagging, and validating datasets for machine learning workflows.",
  },
];

const CORE_STRENGTHS = [
  {
    title: "Problem Solving & Logic",
    desc: "Breaking down complex business requirements into modular, step-by-step full-stack solutions.",
    icon: <Zap className="w-5 h-5 text-electric-400" />,
  },
  {
    title: "Clean Responsive UI",
    desc: "Crafting modern layouts using React, Tailwind CSS, and Bootstrap that look flawless across all screen sizes.",
    icon: <Code className="w-5 h-5 text-violetAccent-400" />,
  },
  {
    title: "Reliable Backend & Databases",
    desc: "Connecting secure Node.js & Express REST APIs with structured MongoDB and MySQL database queries.",
    icon: <Layers className="w-5 h-5 text-emerald-400" />,
  },
  {
    title: "Customer Focus & Ownership",
    desc: "Committed to transparent communication, timely project delivery, and 30-day post-launch support.",
    icon: <HeartHandshake className="w-5 h-5 text-cyan-400" />,
  },
];

export default function AboutPage() {
  return (
    <div className="pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <FadeIn>
            <Badge variant="electric" size="sm" className="mb-4">
              About Me
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Engineering Clean{" "}
              <span className="bg-gradient-to-r from-electric-400 via-violetAccent-400 to-electric-300 bg-clip-text text-transparent">
                Full-Stack Web Apps
              </span>{" "}
              with Purpose.
            </h1>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed">
              Hi, I&apos;m Komal Maurya. I build modern, responsive web applications, e-commerce storefronts, and interactive dashboards with React, Node.js, Express, and MongoDB.
            </p>
          </FadeIn>
        </div>

        {/* Narrative & Profile Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start my-16">
          {/* Main Story */}
          <div className="lg:col-span-7 space-y-6 text-slate-300 leading-relaxed text-base">
            <FadeIn delay={0.1}>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Full-Stack Web Development with Focus &amp; Precision
              </h2>
              <p>
                I am a full-stack software developer with <strong>6 months of industry internship experience at Metrics Mart Infoline Pvt. Ltd.</strong> and hands-on expertise building responsive, production-ready web applications. Currently completing my Bachelor of Science in Computer Science at the University of Mumbai (holding an <strong>8.53 CGPA</strong>), I bridge academic rigor with real-world engineering practices.
              </p>
              <p>
                My development stack is anchored in <strong>React.js, Node.js, Express.js, MongoDB, and MySQL</strong>. I take pride in creating responsive user interfaces that adapt gracefully across mobile, tablet, and desktop viewports, backed by clean RESTful APIs and well-modeled databases.
              </p>
              <p>
                I have engineered several complete, live web applications from scratch — including <strong>SketchNest</strong> (an interactive art learning and community platform with drawing challenges and feedback), <strong>KFOOD</strong> (a Korean food e-commerce store with dynamic catalog filtering, cart state, and order workflows), <strong>AI Expense &amp; Business Analytics SaaS</strong>, and <strong>MEMORA</strong> (a scrapbook event calendar).
              </p>
              <p>
                Whether you need a full business website, a dynamic web application, or a customized dashboard, I bring clean code structure, attention to detail, and genuine dedication to every project.
              </p>

              {/* Skills Pill Badges */}
              <div className="pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Technical Toolkit
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React.js",
                    "Node.js",
                    "Express.js",
                    "JavaScript (ES6+)",
                    "MongoDB",
                    "MySQL",
                    "PostgreSQL",
                    "Tailwind CSS",
                    "Bootstrap",
                    "HTML5 / CSS3",
                    "Python",
                    "Render Cloud",
                    "Git & GitHub",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-charcoal-900 border border-white/10 text-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Profile Card */}
          <div className="lg:col-span-5">
            <FadeIn delay={0.2}>
              <div className="p-8 rounded-3xl bg-charcoal-900 border border-white/10 space-y-6 shadow-xl">
                <div className="flex items-center gap-3.5 pb-6 border-b border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-electric-500/10 border border-electric-400/20 flex items-center justify-center text-electric-400 shrink-0">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xl">Komal Maurya</h3>
                    <p className="text-xs text-electric-400 font-semibold">Full-Stack Web Developer</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-electric-400" /> Location:
                    </span>
                    <span className="font-medium text-white">Mumbai, Maharashtra, India</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-violetAccent-400" /> Education:
                    </span>
                    <span className="font-medium text-white">B.Sc CS (8.53 CGPA)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-electric-400" /> Internship:
                    </span>
                    <span className="font-medium text-white">Metrics Mart Infoline (6 Mos)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-400" /> Phone:
                    </span>
                    <a
                      href="tel:+918591240293"
                      className="font-medium text-white hover:text-electric-400 transition-colors"
                    >
                      +91 8591240293
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" /> Email:
                    </span>
                    <a
                      href="mailto:komalmaurya09072005@gmail.com"
                      className="font-medium text-white hover:text-electric-400 transition-colors truncate max-w-[200px]"
                    >
                      komalmaurya09072005@gmail.com
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Github className="w-4 h-4 text-slate-300" /> GitHub:
                    </span>
                    <a
                      href="https://github.com/komalmauryagithub"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-electric-400 hover:underline"
                    >
                      komalmauryagithub
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-slate-400">Freelance Status:</span>
                    <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Available for Projects
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="primary" className="w-full" href="/contact">
                    Start a Project Inquiry
                  </Button>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Work Experience / Internship Section */}
        <div className="my-24">
          <SectionHeading
            badge="Practical Industry Experience"
            badgeVariant="electric"
            title="Work Experience &amp;"
            titleHighlight="Internship"
            subtitle="Hands-on production contributions, engineering collaboration, and real-world software delivery."
          />

          <FadeIn>
            <Card className="p-8 lg:p-10 bg-charcoal-900 border border-white/10 relative overflow-hidden shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-electric-500/10 border border-electric-400/20 flex items-center justify-center text-electric-400 shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">
                        Web Development Intern
                      </h3>
                      <Badge variant="electric" size="sm">
                        6 Months Completed
                      </Badge>
                    </div>
                    <p className="text-base font-semibold text-electric-400 mt-1 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>Metrics Mart Infoline Pvt. Ltd.</span>
                    </p>
                  </div>
                </div>

                <div className="text-xs sm:text-sm font-semibold text-slate-300 bg-charcoal-800/80 px-4 py-2 rounded-xl border border-white/5 w-fit">
                  Full-Stack &amp; Frontend Web Engineering
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Key Responsibilities &amp; Learnings:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-charcoal-850/60 border border-white/5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Contributed to production web application features, building responsive, reusable UI components using modern JavaScript, React, and CSS styling.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-charcoal-850/60 border border-white/5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Assisted in developing backend API endpoints, form processing routines, server-side data validation, and database operations.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-charcoal-850/60 border border-white/5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Collaborated closely with senior developers and mentors on bug resolution, code reviews, and maintaining clean code standards.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-charcoal-850/60 border border-white/5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Mastered industry-standard Git version control workflows, branch collaboration, and agile project delivery cycles.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>
        </div>

        {/* Education Section */}
        <div className="my-24">
          <SectionHeading
            badge="Academic Background"
            badgeVariant="electric"
            title="Education &amp;"
            titleHighlight="Academic Excellence"
            subtitle="Solid foundations in Computer Science principles, practical software labs, and mathematics."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EDUCATION.map((edu, idx) => (
              <FadeIn key={edu.degree} delay={idx * 0.1}>
                <Card className="p-7 h-full bg-charcoal-900 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-electric-500/10 border border-electric-400/20 flex items-center justify-center text-electric-400">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <Badge variant="emerald" size="sm">
                        {edu.score}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1.5 leading-snug">
                      {edu.degree}
                    </h3>

                    <p className="text-xs font-semibold text-electric-400 mb-3">
                      {edu.institution}
                    </p>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {edu.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-400 font-medium">
                    {edu.period}
                  </div>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Certifications Section */}
        <div className="my-24">
          <SectionHeading
            badge="Verified Credentials"
            badgeVariant="violet"
            title="Certifications &amp;"
            titleHighlight="Skill Training"
            subtitle="Continuous practical skill development and industry simulations."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CERTIFICATIONS.map((cert, idx) => (
              <FadeIn key={cert.title} delay={idx * 0.08}>
                <Card className="p-6 h-full bg-charcoal-850/80 border border-white/10 flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-violetAccent-500/10 border border-violetAccent-400/20 flex items-center justify-center text-violetAccent-400 mb-4">
                    <Award className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">
                    {cert.title}
                  </h3>

                  <p className="text-xs font-semibold text-violetAccent-300 mb-2">
                    {cert.issuer}
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed mt-auto">
                    {cert.desc}
                  </p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Core Strengths */}
        <div className="my-24">
          <SectionHeading
            badge="How I Work"
            badgeVariant="emerald"
            title="Core Strengths That Deliver"
            titleHighlight="Consistent Results"
            subtitle="My personal commitment to quality, clear communication, and customer satisfaction."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CORE_STRENGTHS.map((s, idx) => (
              <FadeIn key={s.title} delay={idx * 0.1}>
                <Card className="p-8 h-full bg-charcoal-900 border border-white/10 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-charcoal-800 border border-white/10 flex items-center justify-center shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      <ContactCtaSection />
    </div>
  );
}
