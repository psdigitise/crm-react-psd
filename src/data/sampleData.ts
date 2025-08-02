export const sampleLeads = [
  {
    id: '1',
    name: 'Mr Arivanthan',
    firstName: 'Arivanthan',
    lastName: '',
    organization: 'Stationery Shop',
    status: 'New' as const,
    email: 'arivanthan@stationery.com',
    mobile: '9361356913',
    assignedTo: 'mx.techies',
    lastModified: '27 minutes ago',
    leadId: 'CRM-LEAD-2025-00035',
    website: 'www.stationeryshop.com',
    territory: 'South',
    industry: 'Retail',
    jobTitle: 'Store Manager',
    source: 'Website',
    salutation: 'Mr'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    firstName: 'Sarah',
    lastName: 'Johnson',
    organization: 'Tech Solutions Inc',
    status: 'Contacted' as const,
    email: 'sarah.johnson@techsol.com',
    mobile: '9876543210',
    assignedTo: 'ALEX',
    lastModified: '1 hour ago',
    leadId: 'CRM-LEAD-2025-00036',
    website: 'www.techsolutions.com',
    territory: 'North',
    industry: 'Technology',
    jobTitle: 'CTO',
    source: 'Referral',
    salutation: 'Ms'
  },
  {
    id: '3',
    name: 'Michael Chen',
    firstName: 'Michael',
    lastName: 'Chen',
    organization: 'Digital Marketing Co',
    status: 'Qualified' as const,
    email: 'michael.chen@digmarketing.com',
    mobile: '8765432109',
    assignedTo: 'SARAH',
    lastModified: '2 hours ago',
    leadId: 'CRM-LEAD-2025-00037',
    website: 'www.digitalmarketing.com',
    territory: 'East',
    industry: 'Marketing',
    jobTitle: 'Marketing Director',
    source: 'LinkedIn',
    salutation: 'Mr'
  },
  {
    id: '4',
    name: 'Emma Williams',
    firstName: 'Emma',
    lastName: 'Williams',
    organization: 'Retail Empire',
    status: 'New' as const,
    email: 'emma.williams@retailempire.com',
    mobile: '7654321098',
    assignedTo: 'DEMO',
    lastModified: '3 hours ago',
    leadId: 'CRM-LEAD-2025-00038',
    website: 'www.retailempire.com',
    territory: 'West',
    industry: 'Retail',
    jobTitle: 'Operations Manager',
    source: 'Cold Call',
    salutation: 'Ms'
  },
  {
    id: '5',
    name: 'David Rodriguez',
    firstName: 'David',
    lastName: 'Rodriguez',
    organization: 'Construction Plus',
    status: 'Lost' as const,
    email: 'david.rodriguez@constructionplus.com',
    mobile: '6543210987',
    assignedTo: 'MIKE',
    lastModified: '1 day ago',
    leadId: 'CRM-LEAD-2025-00039',
    website: 'www.constructionplus.com',
    territory: 'South',
    industry: 'Construction',
    jobTitle: 'Project Manager',
    source: 'Trade Show',
    salutation: 'Mr'
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    firstName: 'Lisa',
    lastName: 'Thompson',
    organization: 'Healthcare Partners',
    status: 'Contacted' as const,
    email: 'lisa.thompson@healthpartners.com',
    mobile: '5432109876',
    assignedTo: 'SARAH',
    lastModified: '2 days ago',
    leadId: 'CRM-LEAD-2025-00040',
    website: 'www.healthpartners.com',
    territory: 'North',
    industry: 'Healthcare',
    jobTitle: 'Chief Medical Officer',
    source: 'Email Campaign',
    salutation: 'Dr'
  }
];

export const sampleDeals = [
  {
    id: '1',
    name: 'Enterprise Software License',
    organization: 'Tech Solutions Inc',
    status: 'Proposal' as const,
    value: '$50,000',
    stage: 'Negotiation',
    assignedTo: 'ALEX',
    closeDate: '2024-02-15',
    lastModified: '1 hour ago'
  },
  {
    id: '2',
    name: 'Marketing Campaign Package',
    organization: 'Digital Marketing Co',
    status: 'Qualified' as const,
    value: '$25,000',
    stage: 'Proposal',
    assignedTo: 'SARAH',
    closeDate: '2024-02-20',
    lastModified: '2 hours ago'
  },
  {
    id: '3',
    name: 'Construction Management System',
    organization: 'Construction Plus',
    status: 'Lost' as const,
    value: '$75,000',
    stage: 'Closed Lost',
    assignedTo: 'MIKE',
    closeDate: '2024-01-30',
    lastModified: '1 day ago'
  },
  {
    id: '4',
    name: 'Healthcare Analytics Platform',
    organization: 'Healthcare Partners',
    status: 'Negotiation' as const,
    value: '$100,000',
    stage: 'Contract Review',
    assignedTo: 'SARAH',
    closeDate: '2024-03-01',
    lastModified: '3 hours ago'
  },
  {
    id: '5',
    name: 'Retail POS System',
    organization: 'Retail Empire',
    status: 'New' as const,
    value: '$30,000',
    stage: 'Discovery',
    assignedTo: 'DEMO',
    closeDate: '2024-02-28',
    lastModified: '4 hours ago'
  }
];

export const sampleContacts = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@techsol.com',
    phone: '+1-555-0123',
    organization: 'Tech Solutions Inc',
    position: 'CTO',
    lastContact: '2024-01-15',
    assignedTo: 'ALEX'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria.garcia@digmarketing.com',
    phone: '+1-555-0124',
    organization: 'Digital Marketing Co',
    position: 'Marketing Director',
    lastContact: '2024-01-14',
    assignedTo: 'SARAH'
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.johnson@constructionplus.com',
    phone: '+1-555-0125',
    organization: 'Construction Plus',
    position: 'Project Manager',
    lastContact: '2024-01-10',
    assignedTo: 'MIKE'
  },
  {
    id: '4',
    name: 'Dr. Emily Chen',
    email: 'emily.chen@healthpartners.com',
    phone: '+1-555-0126',
    organization: 'Healthcare Partners',
    position: 'Chief Medical Officer',
    lastContact: '2024-01-16',
    assignedTo: 'SARAH'
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@retailempire.com',
    phone: '+1-555-0127',
    organization: 'Retail Empire',
    position: 'Operations Manager',
    lastContact: '2024-01-12',
    assignedTo: 'DEMO'
  }
];

export const sampleOrganizations = [
  {
    id: '1',
    name: 'Tech Solutions Inc',
    website: 'www.techsolutions.com',
    industry: 'Technology',
    annualRevenue: '$5.2M',
    employees: '50-100',
    location: 'San Francisco, CA',
    lastModified: '2 days ago'
  },
  {
    id: '2',
    name: 'Digital Marketing Co',
    website: 'www.digitalmarketing.com',
    industry: 'Marketing & Advertising',
    annualRevenue: '$2.8M',
    employees: '25-50',
    location: 'New York, NY',
    lastModified: '1 day ago'
  },
  {
    id: '3',
    name: 'Construction Plus',
    website: 'www.constructionplus.com',
    industry: 'Construction',
    annualRevenue: '$12.5M',
    employees: '100-250',
    location: 'Austin, TX',
    lastModified: '3 days ago'
  },
  {
    id: '4',
    name: 'Healthcare Partners',
    website: 'www.healthcarepartners.com',
    industry: 'Healthcare',
    annualRevenue: '$25.0M',
    employees: '250-500',
    location: 'Boston, MA',
    lastModified: '1 day ago'
  },
  {
    id: '5',
    name: 'Retail Empire',
    website: 'www.retailempire.com',
    industry: 'Retail',
    annualRevenue: '$8.7M',
    employees: '100-200',
    location: 'Chicago, IL',
    lastModified: '4 hours ago'
  },
  {
    id: '6',
    name: 'Stationery Shop',
    website: 'www.stationeryshop.com',
    industry: 'Office Supplies',
    annualRevenue: '$500K',
    employees: '5-10',
    location: 'Portland, OR',
    lastModified: '6 hours ago'
  }
];

export const dashboardStats = {
  openDeals: 48,
  leads: 450,
  todayTasks: 5
};

export const todayTasks = [
  {
    id: '1',
    subject: 'Register for upcoming CRM Webinars',
    dueDate: '09/06/2025',
    status: 'Not Started',
    priority: 'Low'
  },
  {
    id: '2',
    subject: 'Follow up on upcoming CRM Webinars',
    dueDate: '09/06/2025',
    status: 'Not Started',
    priority: 'Normal'
  },
  {
    id: '3',
    subject: 'Register for upcoming CRM Webinars',
    dueDate: '09/06/2025',
    status: 'Not Started',
    priority: 'Good'
  }
];

export const openDeals = [
  {
    id: '1',
    subject: 'Register for upcoming CRM Webinars',
    dueDate: '09/06/2025',
    status: 'Not Started',
    priority: 'Low'
  },
  {
    id: '2',
    subject: 'Follow up on upcoming CRM Webinars',
    dueDate: '09/06/2025',
    status: 'Not Started',
    priority: 'Normal'
  },
  {
    id: '3',
    subject: 'Register for upcoming CRM Webinars',
    dueDate: '09/06/2025',
    status: 'Not Started',
    priority: 'Good'
  }
];

export const todayLeads = [
  {
    id: '1',
    subject: 'Register for upcoming CRM Webinars',
    dueDate: '09/06/2025',
    status: 'Not Started',
    priority: 'Low'
  },
  {
    id: '2',
    subject: 'Register for upcoming CRM Webinars',
    dueDate: '09/06/2025',
    status: 'Not Started',
    priority: 'Normal'
  },
  {
    id: '3',
    subject: 'Register for upcoming CRM Webinars',
    dueDate: '09/06/2025',
    status: 'Not Started',
    priority: 'Good'
  }
];

export const dealsClosingThisMonth = [
  {
    id: '1',
    subject: 'Register for upcoming CRM Webinars',
    dueDate: '09/06/2025',
    status: 'Not Started',
    priority: 'Low'
  },
  {
    id: '2',
    subject: 'Register for upcoming CRM Webinars',
    dueDate: '09/06/2025',
    status: 'Not Started',
    priority: 'Normal'
  },
  {
    id: '3',
    subject: 'Register for upcoming CRM Webinars',
    dueDate: '09/06/2025',
    status: 'Not Started',
    priority: 'Good'
  }
];