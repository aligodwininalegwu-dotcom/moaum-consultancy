/**
 * Static site content. Contact details, officers and testimonials below are
 * realistic PLACEHOLDERS — replace them with the Unit's confirmed information
 * before going live.
 */

export const site = {
  name: "MOAUM Consultancy",
  university: "Rev. Fr. Moses Orshio Adasu University, Makurdi",
  formerly: "formerly Benue State University",
  unit: "Consultancy Unit",
  motto: "Scientia Liberatio Populorum",
  mottoEnglish: "Knowledge for the Liberation of the People",
  description:
    "The Consultancy Unit of Rev. Fr. Moses Orshio Adasu University, Makurdi manages campus shop allocation, e-learning and summer computer programmes, training, and professional consultancy services.",
  // Used for email links and the Paystack return address. On Vercel this falls
  // back to the project's production domain if NEXTAUTH_URL isn't set.
  url:
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  contact: {
    address: "Consultancy Unit, Senate Building Annex, Main Campus, Rev. Fr. Moses Orshio Adasu University, P.M.B. 102119, Makurdi, Benue State",
    email: "consultancy@moaum.edu.ng",
    phone: "+234 803 000 0000",
    phoneAlt: "+234 805 000 0000",
    hours: "Monday – Friday, 8:00am – 4:00pm",
  },
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/shops", label: "Shop Allocation" },
  { href: "/programmes", label: "Programmes" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const stats = [
  { value: 17, suffix: "", label: "Campus shops managed" },
  { value: 2400, suffix: "+", label: "Learners trained" },
  { value: 9, suffix: "", label: "Active programmes" },
  { value: 96, suffix: "%", label: "Participant satisfaction" },
];

export const testimonials = [
  {
    quote:
      "The allocation process was transparent from start to finish. I tracked my application online and received my allocation letter without having to queue at any office.",
    name: "Mrs. Ngodoo Shima",
    role: "Proprietor, Shima's Kitchen — Eastern Campus",
  },
  {
    quote:
      "The Website Design summer programme gave me a real portfolio. Two weeks after finishing, I built a site for a business in Wurukum and got paid for it.",
    name: "Doosuur Iorliam",
    role: "300L Computer Science",
  },
  {
    quote:
      "Our staff attended the Research Methods & SPSS course online. The facilitators were excellent and the live clinics answered exactly the questions we had.",
    name: "Dr. Mfa Ugah",
    role: "Department of Sociology",
  },
  {
    quote:
      "I came in barely able to use Excel. After the Microsoft Office Proficiency course I now prepare our faculty's monthly reports myself.",
    name: "Mr. Ojonugwa Adah",
    role: "Administrative Officer",
  },
];

export const objectives = [
  "Generate sustainable internal revenue for the University through professional services.",
  "Provide an orderly, transparent and fair framework for allocating campus commercial spaces.",
  "Equip students, staff and the public with in-demand digital and entrepreneurial skills.",
  "Connect University expertise to government, industry and community needs.",
  "Promote a culture of enterprise, innovation and self-reliance among students.",
];

/** Placeholder officers — replace with the Unit's actual leadership. */
export const leadership = [
  { name: "Prof. Iorwuese T. Aondoakaa", role: "Director, Consultancy Unit", email: "director.consultancy@moaum.edu.ng", initials: "IA" },
  { name: "Dr. Mnena Ukeyima", role: "Deputy Director, Programmes & Training", email: "programmes@moaum.edu.ng", initials: "MU" },
  { name: "Mr. Terver Akaa", role: "Estate & Shop Allocation Officer", email: "shops@moaum.edu.ng", initials: "TA" },
  { name: "Mrs. Ene Ochai", role: "Finance & Accounts Officer", email: "accounts.consultancy@moaum.edu.ng", initials: "EO" },
];

export const shopGuidelines = [
  {
    title: "Eligibility",
    body: "Applications are open to registered students, staff and members of the public with a lawful business. Students must be in good academic standing; external applicants must provide a valid means of identification.",
  },
  {
    title: "Required documents",
    body: "A valid ID (student ID card, staff ID, NIN slip, driver's licence or international passport) and a short business proposal (PDF or photo, max. 2 MB each) describing the business, target customers, pricing and staffing.",
  },
  {
    title: "Assessment",
    body: "Applications are screened for completeness and assessed on the viability of the proposal, relevance to the campus community, hygiene and safety standards (for food vendors) and the applicant's track record.",
  },
  {
    title: "Rent & payment",
    body: "Rent is payable annually in advance to the University's designated account. A refundable caution deposit equal to 10% of annual rent is required before keys are released.",
  },
  {
    title: "Conduct & renewal",
    body: "Tenants must comply with University regulations, display regulated prices, and keep premises clean. Tenancies are reviewed yearly; sub-letting is strictly prohibited and leads to revocation.",
  },
];

export const shopFaqs = [
  {
    q: "How long does it take to process an application?",
    a: "Most applications are screened within 10 working days. Shortlisted applicants may be invited for a brief interview before an allocation decision is made.",
  },
  {
    q: "Can I apply for more than one shop?",
    a: "You may submit one active application per campus. Indicate your preferred shop; the committee may offer a comparable alternative if your preference is unavailable.",
  },
  {
    q: "How do I check my application status?",
    a: "Sign in to your dashboard, or use the tracking tool on the Shop Allocation page with the reference number shown after you submit (e.g. MOAUM-SA-2026-4F7K2).",
  },
  {
    q: "When do I receive my allocation letter?",
    a: "Once your application is marked Allocated, a downloadable allocation letter appears in your dashboard. Present it at the Bursary when making payment.",
  },
];

export const programmeFaqs = [
  {
    q: "Who can register for the summer programmes?",
    a: "Summer Computer Programmes are open to MOAUM students, staff, secondary-school leavers and members of the public. No prior experience is needed for beginner courses.",
  },
  {
    q: "How do I pay?",
    a: "After registering, pay by bank transfer using the account details shown on your dashboard and quote your registration reference. Then submit the transaction reference so our accounts officer can verify it.",
  },
  {
    q: "Will I receive a certificate?",
    a: "Yes. Participants who meet the attendance and assessment requirements receive a Certificate of Completion issued by the Consultancy Unit.",
  },
  {
    q: "Are e-learning courses self-paced?",
    a: "E-learning courses combine self-paced lessons with scheduled live sessions. Recordings are available for participants who miss a session.",
  },
];

export const otherServices = [
  {
    icon: "Compass",
    title: "Career Guidance & Counselling",
    body: "One-on-one sessions, CV reviews, mock interviews and graduate employability workshops for students and young alumni.",
  },
  {
    icon: "Presentation",
    title: "Training & Capacity Building",
    body: "Customised workshops for public and private organisations in ICT, leadership, research methods and financial management.",
  },
  {
    icon: "Building2",
    title: "Facility & Venue Booking",
    body: "Book the University auditorium, ICT Centre labs, lecture theatres and conference rooms for seminars, exams and events.",
  },
  {
    icon: "LineChart",
    title: "Research & Advisory Consultancy",
    body: "Feasibility studies, impact assessments, surveys and policy advisory delivered by multidisciplinary University experts.",
  },
  {
    icon: "Printer",
    title: "Printing & Publishing Support",
    body: "Formatting, proofreading and printing of theses, conference proceedings, reports and institutional publications.",
  },
  {
    icon: "Sprout",
    title: "Agro-Enterprise Advisory",
    body: "Technical advice for farmers and agro-businesses in the Food Basket of the Nation, drawing on the University's agricultural expertise.",
  },
];
