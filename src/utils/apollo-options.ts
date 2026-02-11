// Apollo API filter options

export interface SelectOption {
  value: string;
  label: string;
}

export const PERSON_TITLES: SelectOption[] = [
  { value: "CEO", label: "CEO" },
  { value: "Founder", label: "Founder" },
  { value: "Co-Founder", label: "Co-Founder" },
  { value: "Owner", label: "Owner" },
  { value: "President", label: "President" },
  { value: "Managing Director", label: "Managing Director" },
  { value: "Director", label: "Director" },
  { value: "VP", label: "VP" },
  { value: "Vice President", label: "Vice President" },
  { value: "Head of", label: "Head of" },
  { value: "Chief Executive Officer", label: "Chief Executive Officer" },
  { value: "Chief Operating Officer", label: "Chief Operating Officer" },
  { value: "Chief Technology Officer", label: "Chief Technology Officer" },
  { value: "Chief Marketing Officer", label: "Chief Marketing Officer" },
  { value: "Chief Financial Officer", label: "Chief Financial Officer" },
  { value: "General Manager", label: "General Manager" },
  { value: "Partner", label: "Partner" },
  { value: "Principal", label: "Principal" },
];

export const PERSON_SENIORITIES: SelectOption[] = [
  { value: "owner", label: "Owner" },
  { value: "founder", label: "Founder" },
  { value: "c_suite", label: "C-Suite" },
  { value: "partner", label: "Partner" },
  { value: "vp", label: "VP" },
  { value: "head", label: "Head" },
  { value: "director", label: "Director" },
  { value: "manager", label: "Manager" },
  { value: "senior", label: "Senior" },
  { value: "entry", label: "Entry" },
  { value: "intern", label: "Intern" },
];

export const ORGANIZATION_LOCATIONS: SelectOption[] = [
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Spain", label: "Spain" },
  { value: "Italy", label: "Italy" },
  { value: "Sweden", label: "Sweden" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "Ireland", label: "Ireland" },
  { value: "Singapore", label: "Singapore" },
  { value: "India", label: "India" },
  { value: "Japan", label: "Japan" },
  { value: "Brazil", label: "Brazil" },
  { value: "Mexico", label: "Mexico" },
  { value: "New Zealand", label: "New Zealand" },
];

export const EMPLOYEE_RANGES: SelectOption[] = [
  { value: "1,10", label: "1-10 employees" },
  { value: "11,20", label: "11-20 employees" },
  { value: "21,50", label: "21-50 employees" },
  { value: "51,100", label: "51-100 employees" },
  { value: "101,200", label: "101-200 employees" },
  { value: "201,500", label: "201-500 employees" },
  { value: "501,1000", label: "501-1,000 employees" },
  { value: "1001,5000", label: "1,001-5,000 employees" },
  { value: "5001,10000", label: "5,001-10,000 employees" },
  { value: "10001,", label: "10,001+ employees" },
];

export const INDUSTRIES: SelectOption[] = [
  { value: "5567cd4773696439b10b0000", label: "Information Technology & Services" },
  { value: "5567cd4773696439b1090000", label: "Computer Software" },
  { value: "5567cd4773696439b1080000", label: "Internet" },
  { value: "5567cd4773696439b10d0000", label: "Marketing & Advertising" },
  { value: "5567cd4773696439b1040000", label: "Financial Services" },
  { value: "5567cd4773696439b1070000", label: "Real Estate" },
  { value: "5567cd4773696439b1050000", label: "Hospital & Health Care" },
  { value: "5567cd4773696439b1030000", label: "Construction" },
  { value: "5567cd4773696439b10c0000", label: "Management Consulting" },
  { value: "5567cd4773696439b1060000", label: "Retail" },
  { value: "5567cd4773696439b10a0000", label: "E-Learning" },
  { value: "5567cd4773696439b1020000", label: "Accounting" },
  { value: "5567cd4773696439b1010000", label: "Legal Services" },
  { value: "5567cd4773696439b10e0000", label: "Staffing & Recruiting" },
  { value: "5567cd4773696439b10f0000", label: "Design" },
];