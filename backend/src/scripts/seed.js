const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

// Connect to database
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample companies
const companies = [
  {
    name: 'TechCorp Solutions',
    domain: 'techcorp.com',
    isActive: true,
    ein: '12-3456789',
    address: {
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'US'
    },
    contactInfo: {
      email: 'hr@techcorp.com',
      phone: '(555) 123-4567',
      website: 'https://techcorp.com'
    },
    subscription: {
      plan: 'premium',
      status: 'active',
      maxEmployees: 500
    },
    matchingProgram: {
      enabled: true,
      type: 'percentage',
      percentage: 50,
      annualLimit: 50000,
      usedAmount: 0,
      preferredCharities: []
    },
    settings: {
      allowEmployeeCharitySelection: true,
      requireApprovalForDonations: false,
      taxYear: new Date().getFullYear(),
      payrollIntegration: {
        provider: 'none',
        apiKey: null,
        webhookUrl: null
      }
    }
  },
  {
    name: 'Green Energy Co',
    domain: 'greenenergy.com',
    isActive: true,
    ein: '98-7654321',
    address: {
      street: '456 Green Avenue',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'US'
    },
    contactInfo: {
      email: 'hr@greenenergy.com',
      phone: '(555) 987-6543',
      website: 'https://greenenergy.com'
    },
    subscription: {
      plan: 'basic',
      status: 'active',
      maxEmployees: 100
    },
    matchingProgram: {
      enabled: true,
      type: 'fixed',
      fixedAmount: 25,
      annualLimit: 10000,
      usedAmount: 0,
      preferredCharities: []
    },
    settings: {
      allowEmployeeCharitySelection: true,
      requireApprovalForDonations: false,
      taxYear: new Date().getFullYear(),
      payrollIntegration: {
        provider: 'none',
        apiKey: null,
        webhookUrl: null
      }
    }
  },
  {
    name: 'Global Finance Inc',
    domain: 'globalfinance.com',
    isActive: true,
    ein: '11-2233445',
    address: {
      street: '789 Wall Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10005',
      country: 'US'
    },
    contactInfo: {
      email: 'hr@globalfinance.com',
      phone: '(555) 456-7890',
      website: 'https://globalfinance.com'
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      maxEmployees: 1000
    },
    matchingProgram: {
      enabled: true,
      type: 'percentage',
      percentage: 100,
      annualLimit: 100000,
      usedAmount: 0,
      preferredCharities: []
    },
    settings: {
      allowEmployeeCharitySelection: true,
      requireApprovalForDonations: false,
      taxYear: new Date().getFullYear(),
      payrollIntegration: {
        provider: 'none',
        apiKey: null,
        webhookUrl: null
      }
    }
  }
];

// Sample charities
const charities = [
  {
    name: 'American Red Cross',
    ein: '13-5562305',
    description: 'The American Red Cross prevents and alleviates human suffering in the face of emergencies by mobilizing the power of volunteers and the generosity of donors.',
    category: 'HUMAN_SERVICES',
    subcategory: 'disaster_relief',
    website: 'https://www.redcross.org',
    address: {
      street: '431 18th Street NW',
      city: 'Washington',
      state: 'DC',
      zipCode: '20006',
      country: 'US'
    },
    contactInfo: {
      email: 'info@redcross.org',
      phone: '(202) 303-5000'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.5,
      financialScore: 95,
      accountabilityScore: 92
    },
    impact: {
      description: 'Helping people affected by disasters and other emergencies',
      metrics: [
        { name: 'People Helped', value: '1000000', unit: 'annually' },
        { name: 'Disasters Responded To', value: '60000', unit: 'annually' }
      ]
    },
    donationInfo: {
      minimumAmount: 1,
      maximumAmount: 50000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: true
  },
  {
    name: 'World Wildlife Fund',
    ein: '13-5562306',
    description: 'WWF works to conserve nature and reduce the most pressing threats to the diversity of life on Earth.',
    category: 'ENVIRONMENT',
    subcategory: 'wildlife_conservation',
    website: 'https://www.worldwildlife.org',
    address: {
      street: '1250 24th Street NW',
      city: 'Washington',
      state: 'DC',
      zipCode: '20037',
      country: 'US'
    },
    contactInfo: {
      email: 'info@wwfus.org',
      phone: '(202) 293-4800'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.2,
      financialScore: 88,
      accountabilityScore: 90
    },
    impact: {
      description: 'Protecting wildlife and their habitats around the world',
      metrics: [
        { name: 'Species Protected', value: '1000', unit: 'species' },
        { name: 'Acres Protected', value: '1000000', unit: 'acres' }
      ]
    },
    donationInfo: {
      minimumAmount: 1,
      maximumAmount: 25000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: true
  },
  {
    name: 'Doctors Without Borders',
    ein: '13-3433452',
    description: 'Doctors Without Borders provides medical care to people affected by conflict, epidemics, disasters, or exclusion from healthcare.',
    category: 'HEALTH',
    subcategory: 'international_health',
    website: 'https://www.doctorswithoutborders.org',
    address: {
      street: '40 Rector Street, 16th Floor',
      city: 'New York',
      state: 'NY',
      zipCode: '10006',
      country: 'US'
    },
    contactInfo: {
      email: 'info@newyork.msf.org',
      phone: '(212) 679-6800'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.7,
      financialScore: 96,
      accountabilityScore: 94
    },
    impact: {
      description: 'Providing medical care in crisis situations worldwide',
      metrics: [
        { name: 'Patients Treated', value: '10000000', unit: 'annually' },
        { name: 'Countries Active', value: '70', unit: 'countries' }
      ]
    },
    donationInfo: {
      minimumAmount: 1,
      maximumAmount: 10000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: true
  },
  {
    name: 'Local Food Bank',
    ein: '12-3456789',
    description: 'Providing food assistance to families in need in our local community.',
    category: 'HUMAN_SERVICES',
    subcategory: 'food_assistance',
    website: 'https://www.localfoodbank.org',
    address: {
      street: '123 Community Drive',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US'
    },
    contactInfo: {
      email: 'info@localfoodbank.org',
      phone: '(555) 123-4567'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'manual',
      verifiedAt: new Date(),
      rating: 4.0,
      financialScore: 85,
      accountabilityScore: 88
    },
    impact: {
      description: 'Fighting hunger in our local community',
      metrics: [
        { name: 'Meals Provided', value: '500000', unit: 'annually' },
        { name: 'Families Served', value: '10000', unit: 'families' }
      ]
    },
    donationInfo: {
      minimumAmount: 5,
      maximumAmount: 5000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'Education First Foundation',
    ein: '98-7654321',
    description: 'Supporting education initiatives for underprivileged children worldwide.',
    category: 'EDUCATION',
    subcategory: 'children_education',
    website: 'https://www.educationfirst.org',
    address: {
      street: '456 Education Lane',
      city: 'Boston',
      state: 'MA',
      zipCode: '02108',
      country: 'US'
    },
    contactInfo: {
      email: 'info@educationfirst.org',
      phone: '(555) 987-6543'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.3,
      financialScore: 90,
      accountabilityScore: 89
    },
    impact: {
      description: 'Improving access to quality education for children',
      metrics: [
        { name: 'Children Helped', value: '50000', unit: 'annually' },
        { name: 'Schools Built', value: '100', unit: 'schools' }
      ]
    },
    donationInfo: {
      minimumAmount: 10,
      maximumAmount: 10000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: true
  }
  ,
  {
    name: 'Feeding America',
    ein: '36-3673599',
    description: 'Nationwide network of food banks feeding the hungry in the U.S.',
    category: 'HUMAN_SERVICES',
    subcategory: 'food_assistance',
    website: 'https://www.feedingamerica.org',
    address: {
      street: '161 N Clark St Suite 700',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'US'
    },
    contactInfo: {
      email: 'info@feedingamerica.org',
      phone: '(800) 771-2303'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.4,
      financialScore: 90,
      accountabilityScore: 93
    },
    impact: {
      description: 'Providing meals to people facing hunger',
      metrics: [
        { name: 'Meals Provided', value: '6000000000', unit: 'meals' }
      ]
    },
    donationInfo: {
      minimumAmount: 1,
      maximumAmount: 25000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: true
  },
  {
    name: 'Charity: Water',
    ein: '22-3936753',
    description: 'Bringing clean and safe drinking water to people in developing countries.',
    category: 'INTERNATIONAL',
    subcategory: 'clean_water',
    website: 'https://www.charitywater.org',
    address: {
      street: '40 Worth St',
      city: 'New York',
      state: 'NY',
      zipCode: '10013',
      country: 'US'
    },
    contactInfo: {
      email: 'info@charitywater.org',
      phone: '(646) 688-2323'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.8,
      financialScore: 97,
      accountabilityScore: 95
    },
    impact: {
      description: 'Funding water projects around the world',
      metrics: [
        { name: 'People Served', value: '17000000', unit: 'people' }
      ]
    },
    donationInfo: {
      minimumAmount: 1,
      maximumAmount: 10000,
      suggestedAmounts: [20, 40, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: true
  },
  {
    name: 'The Nature Conservancy',
    ein: '53-0242652',
    description: 'Conserving the lands and waters on which all life depends.',
    category: 'ENVIRONMENT',
    subcategory: 'conservation',
    website: 'https://www.nature.org',
    address: {
      street: '4245 N Fairfax Dr Suite 100',
      city: 'Arlington',
      state: 'VA',
      zipCode: '22203',
      country: 'US'
    },
    contactInfo: {
      email: 'member@tnc.org',
      phone: '(703) 841-5300'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.2,
      financialScore: 89,
      accountabilityScore: 93
    },
    impact: {
      description: 'Protecting nature for people today and future generations',
      metrics: [
        { name: 'Acres Conserved', value: '119000000', unit: 'acres' }
      ]
    },
    donationInfo: {
      minimumAmount: 1,
      maximumAmount: 25000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'Save the Children',
    ein: '06-0726487',
    description: 'Giving children a healthy start in life, the opportunity to learn and protection from harm.',
    category: 'EDUCATION',
    subcategory: 'children',
    website: 'https://www.savethechildren.org',
    address: {
      street: '501 Kings Highway East, Suite 400',
      city: 'Fairfield',
      state: 'CT',
      zipCode: '06825',
      country: 'US'
    },
    contactInfo: {
      email: 'support@savechildren.org',
      phone: '(800) 728-3843'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.0,
      financialScore: 86,
      accountabilityScore: 90
    },
    impact: {
      description: 'Helping children in need around the world',
      metrics: [
        { name: 'Children Reached', value: '100000000', unit: 'children' }
      ]
    },
    donationInfo: {
      minimumAmount: 5,
      maximumAmount: 20000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'Habitat for Humanity',
    ein: '91-1914868',
    description: 'Helping families build and improve places to call home.',
    category: 'HUMAN_SERVICES',
    subcategory: 'housing',
    website: 'https://www.habitat.org',
    address: {
      street: '322 W Lamar St',
      city: 'Americus',
      state: 'GA',
      zipCode: '31709',
      country: 'US'
    },
    contactInfo: {
      email: 'publicinfo@habitat.org',
      phone: '(800) 422-4828'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.1,
      financialScore: 87,
      accountabilityScore: 91
    },
    impact: {
      description: 'Affordable housing for families',
      metrics: [
        { name: 'Homes Built/Repaired', value: '350000', unit: 'homes' }
      ]
    },
    donationInfo: {
      minimumAmount: 10,
      maximumAmount: 25000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'St. Jude Children\'s Research Hospital',
    ein: '62-0646012',
    description: 'Finding cures and saving children with cancer and other life-threatening diseases.',
    category: 'HEALTH',
    subcategory: 'children_health',
    website: 'https://www.stjude.org',
    address: {
      street: '262 Danny Thomas Place',
      city: 'Memphis',
      state: 'TN',
      zipCode: '38105',
      country: 'US'
    },
    contactInfo: {
      email: 'donors@stjude.org',
      phone: '(800) 822-6344'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.7,
      financialScore: 98,
      accountabilityScore: 94
    },
    impact: {
      description: 'Leading research and treatment for pediatric catastrophic diseases',
      metrics: [
        { name: 'Survival Rate Increase', value: '80', unit: 'percent' }
      ]
    },
    donationInfo: {
      minimumAmount: 5,
      maximumAmount: 50000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: true
  },
  {
    name: 'American Cancer Society',
    ein: '13-1788491',
    description: 'Improving the lives of people with cancer and their families.',
    category: 'HEALTH',
    subcategory: 'cancer_research',
    website: 'https://www.cancer.org',
    address: {
      street: '250 Williams Street NW',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30303',
      country: 'US'
    },
    contactInfo: {
      email: 'acs@cancer.org',
      phone: '(800) 227-2345'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.0,
      financialScore: 86,
      accountabilityScore: 90
    },
    impact: {
      description: 'Funding research and patient support',
      metrics: [
        { name: 'Research Grants', value: '1200000000', unit: 'USD' }
      ]
    },
    donationInfo: {
      minimumAmount: 5,
      maximumAmount: 25000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'Direct Relief',
    ein: '95-1831116',
    description: 'Improving the health and lives of people affected by poverty and emergencies.',
    category: 'INTERNATIONAL',
    subcategory: 'disaster_relief',
    website: 'https://www.directrelief.org',
    address: {
      street: '6100 Wallace Becknell Rd',
      city: 'Santa Barbara',
      state: 'CA',
      zipCode: '93117',
      country: 'US'
    },
    contactInfo: {
      email: 'info@directrelief.org',
      phone: '(805) 964-4767'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.9,
      financialScore: 100,
      accountabilityScore: 97
    },
    impact: {
      description: 'Delivering medical resources globally',
      metrics: [
        { name: 'Aid Delivered', value: '2000000000', unit: 'USD' }
      ]
    },
    donationInfo: {
      minimumAmount: 5,
      maximumAmount: 50000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'Best Friends Animal Society',
    ein: '23-7147797',
    description: 'Ending the killing of dogs and cats in America’s shelters.',
    category: 'ANIMALS',
    subcategory: 'animal_welfare',
    website: 'https://bestfriends.org',
    address: {
      street: '5001 Angel Canyon Rd',
      city: 'Kanab',
      state: 'UT',
      zipCode: '84741',
      country: 'US'
    },
    contactInfo: {
      email: 'info@bestfriends.org',
      phone: '(435) 644-2001'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.0,
      financialScore: 87,
      accountabilityScore: 90
    },
    impact: {
      description: 'Saving animals across the country',
      metrics: [
        { name: 'Animals Saved', value: '500000', unit: 'animals' }
      ]
    },
    donationInfo: {
      minimumAmount: 5,
      maximumAmount: 20000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'Girls Who Code',
    ein: '30-0845938',
    description: 'Closing the gender gap in technology.',
    category: 'EDUCATION',
    subcategory: 'technology_education',
    website: 'https://girlswhocode.com',
    address: {
      street: '28 W 23rd St 4th Floor',
      city: 'New York',
      state: 'NY',
      zipCode: '10010',
      country: 'US'
    },
    contactInfo: {
      email: 'info@girlswhocode.com',
      phone: '(347) 268-0000'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.1,
      financialScore: 88,
      accountabilityScore: 91
    },
    impact: {
      description: 'Programs that educate, equip, and inspire girls',
      metrics: [
        { name: 'Students Reached', value: '500000', unit: 'students' }
      ]
    },
    donationInfo: {
      minimumAmount: 5,
      maximumAmount: 10000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'UNICEF USA',
    ein: '13-1760110',
    description: 'Protecting children\'s rights and providing humanitarian assistance.',
    category: 'INTERNATIONAL',
    subcategory: 'children',
    website: 'https://www.unicefusa.org',
    address: {
      street: '125 Maiden Lane',
      city: 'New York',
      state: 'NY',
      zipCode: '10038',
      country: 'US'
    },
    contactInfo: {
      email: 'info@unicefusa.org',
      phone: '(800) 367-5437'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.5,
      financialScore: 92,
      accountabilityScore: 94
    },
    impact: {
      description: 'Supporting children in over 190 countries',
      metrics: [
        { name: 'Children Reached', value: '200000000', unit: 'children' }
      ]
    },
    donationInfo: {
      minimumAmount: 10,
      maximumAmount: 25000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: true
  },
  {
    name: 'The Humane Society of the United States',
    ein: '53-0225390',
    description: 'Fighting for all animals - from companion animals to wildlife.',
    category: 'ANIMALS',
    subcategory: 'animal_welfare',
    website: 'https://www.humanesociety.org',
    address: {
      street: '1255 23rd Street NW Suite 450',
      city: 'Washington',
      state: 'DC',
      zipCode: '20037',
      country: 'US'
    },
    contactInfo: {
      email: 'membership@humanesociety.org',
      phone: '(866) 720-2676'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.2,
      financialScore: 89,
      accountabilityScore: 92
    },
    impact: {
      description: 'Protecting animals through legislation and rescue',
      metrics: [
        { name: 'Animals Protected', value: '5000000', unit: 'animals' }
      ]
    },
    donationInfo: {
      minimumAmount: 5,
      maximumAmount: 20000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'Make-A-Wish America',
    ein: '86-0726985',
    description: 'Granting wishes for children with critical illnesses.',
    category: 'HEALTH',
    subcategory: 'children_health',
    website: 'https://www.wish.org',
    address: {
      street: '1702 E Highland Ave Suite 400',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85016',
      country: 'US'
    },
    contactInfo: {
      email: 'maw@wish.org',
      phone: '(602) 279-9474'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.3,
      financialScore: 90,
      accountabilityScore: 91
    },
    impact: {
      description: 'Granting wishes to bring hope and joy',
      metrics: [
        { name: 'Wishes Granted', value: '500000', unit: 'wishes' }
      ]
    },
    donationInfo: {
      minimumAmount: 10,
      maximumAmount: 25000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: true
  },
  {
    name: 'Ocean Conservancy',
    ein: '23-7245152',
    description: 'Protecting the ocean from today\'s greatest global challenges.',
    category: 'ENVIRONMENT',
    subcategory: 'ocean_conservation',
    website: 'https://www.oceanconservancy.org',
    address: {
      street: '1300 19th Street NW 8th Floor',
      city: 'Washington',
      state: 'DC',
      zipCode: '20036',
      country: 'US'
    },
    contactInfo: {
      email: 'membership@oceanconservancy.org',
      phone: '(800) 519-1541'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.1,
      financialScore: 87,
      accountabilityScore: 90
    },
    impact: {
      description: 'Cleaning oceans and protecting marine life',
      metrics: [
        { name: 'Pounds of Trash Removed', value: '25000000', unit: 'pounds' }
      ]
    },
    donationInfo: {
      minimumAmount: 5,
      maximumAmount: 15000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'National Park Foundation',
    ein: '52-1086761',
    description: 'Protecting and enhancing America\'s National Parks.',
    category: 'ENVIRONMENT',
    subcategory: 'parks_conservation',
    website: 'https://www.nationalparks.org',
    address: {
      street: '1110 Vermont Avenue NW Suite 200',
      city: 'Washington',
      state: 'DC',
      zipCode: '20005',
      country: 'US'
    },
    contactInfo: {
      email: 'askus@nationalparks.org',
      phone: '(888) 467-2757'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.0,
      financialScore: 86,
      accountabilityScore: 89
    },
    impact: {
      description: 'Supporting national parks for future generations',
      metrics: [
        { name: 'Parks Supported', value: '419', unit: 'parks' }
      ]
    },
    donationInfo: {
      minimumAmount: 10,
      maximumAmount: 20000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'Special Olympics',
    ein: '52-0889518',
    description: 'Providing year-round sports training for children and adults with intellectual disabilities.',
    category: 'HUMAN_SERVICES',
    subcategory: 'disability_services',
    website: 'https://www.specialolympics.org',
    address: {
      street: '1133 19th Street NW',
      city: 'Washington',
      state: 'DC',
      zipCode: '20036',
      country: 'US'
    },
    contactInfo: {
      email: 'info@specialolympics.org',
      phone: '(202) 628-3630'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.4,
      financialScore: 91,
      accountabilityScore: 93
    },
    impact: {
      description: 'Empowering people with intellectual disabilities',
      metrics: [
        { name: 'Athletes Served', value: '5000000', unit: 'athletes' }
      ]
    },
    donationInfo: {
      minimumAmount: 5,
      maximumAmount: 15000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: true
  },
  {
    name: 'American Heart Association',
    ein: '13-5613797',
    description: 'Fighting heart disease and stroke through research and education.',
    category: 'HEALTH',
    subcategory: 'heart_health',
    website: 'https://www.heart.org',
    address: {
      street: '7272 Greenville Ave',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75231',
      country: 'US'
    },
    contactInfo: {
      email: 'inquiries@heart.org',
      phone: '(800) 242-8721'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.1,
      financialScore: 88,
      accountabilityScore: 90
    },
    impact: {
      description: 'Funding research and saving lives',
      metrics: [
        { name: 'Research Funding', value: '4800000000', unit: 'USD' }
      ]
    },
    donationInfo: {
      minimumAmount: 10,
      maximumAmount: 25000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'Boys & Girls Clubs of America',
    ein: '13-5562976',
    description: 'Enabling all young people to reach their full potential.',
    category: 'EDUCATION',
    subcategory: 'youth_development',
    website: 'https://www.bgca.org',
    address: {
      street: '1275 Peachtree St NE',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      country: 'US'
    },
    contactInfo: {
      email: 'info@bgca.org',
      phone: '(404) 487-5700'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.2,
      financialScore: 89,
      accountabilityScore: 91
    },
    impact: {
      description: 'Providing safe places and mentorship for youth',
      metrics: [
        { name: 'Youth Served', value: '4000000', unit: 'youth' }
      ]
    },
    donationInfo: {
      minimumAmount: 10,
      maximumAmount: 20000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'American Diabetes Association',
    ein: '13-1623888',
    description: 'Leading the fight against the deadly consequences of diabetes.',
    category: 'HEALTH',
    subcategory: 'diabetes',
    website: 'https://www.diabetes.org',
    address: {
      street: '2451 Crystal Drive Suite 900',
      city: 'Arlington',
      state: 'VA',
      zipCode: '22202',
      country: 'US'
    },
    contactInfo: {
      email: 'askada@diabetes.org',
      phone: '(800) 342-2383'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.0,
      financialScore: 85,
      accountabilityScore: 89
    },
    impact: {
      description: 'Funding research and supporting those with diabetes',
      metrics: [
        { name: 'Research Investment', value: '1700000000', unit: 'USD' }
      ]
    },
    donationInfo: {
      minimumAmount: 10,
      maximumAmount: 25000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'Alzheimer\'s Association',
    ein: '13-3039601',
    description: 'Leading the way to end Alzheimer\'s and all other dementia.',
    category: 'HEALTH',
    subcategory: 'alzheimers',
    website: 'https://www.alz.org',
    address: {
      street: '225 N Michigan Ave Floor 17',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'US'
    },
    contactInfo: {
      email: 'info@alz.org',
      phone: '(800) 272-3900'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.3,
      financialScore: 90,
      accountabilityScore: 92
    },
    impact: {
      description: 'Advancing research and providing care support',
      metrics: [
        { name: 'People Helped', value: '6000000', unit: 'people' }
      ]
    },
    donationInfo: {
      minimumAmount: 10,
      maximumAmount: 25000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'Goodwill Industries International',
    ein: '53-0196517',
    description: 'Enhancing the dignity and quality of life of individuals and families.',
    category: 'HUMAN_SERVICES',
    subcategory: 'job_training',
    website: 'https://www.goodwill.org',
    address: {
      street: '15810 Indianola Drive',
      city: 'Rockville',
      state: 'MD',
      zipCode: '20855',
      country: 'US'
    },
    contactInfo: {
      email: 'contactus@goodwill.org',
      phone: '(800) 466-3945'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.1,
      financialScore: 87,
      accountabilityScore: 90
    },
    impact: {
      description: 'Providing job training and employment services',
      metrics: [
        { name: 'People Served', value: '25000000', unit: 'people' }
      ]
    },
    donationInfo: {
      minimumAmount: 5,
      maximumAmount: 15000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'The Trevor Project',
    ein: '95-4681438',
    description: 'Providing crisis intervention and suicide prevention for LGBTQ youth.',
    category: 'HUMAN_SERVICES',
    subcategory: 'mental_health',
    website: 'https://www.thetrevorproject.org',
    address: {
      street: '202 W 13th Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10011',
      country: 'US'
    },
    contactInfo: {
      email: 'info@thetrevorproject.org',
      phone: '(212) 695-8650'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.5,
      financialScore: 93,
      accountabilityScore: 94
    },
    impact: {
      description: 'Saving young lives through crisis support',
      metrics: [
        { name: 'Crisis Contacts', value: '200000', unit: 'contacts' }
      ]
    },
    donationInfo: {
      minimumAmount: 5,
      maximumAmount: 15000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: true
  },
  {
    name: 'Teach For America',
    ein: '13-3541913',
    description: 'Working to ensure all children have access to an excellent education.',
    category: 'EDUCATION',
    subcategory: 'education_reform',
    website: 'https://www.teachforamerica.org',
    address: {
      street: '25 Broadway 12th Floor',
      city: 'New York',
      state: 'NY',
      zipCode: '10004',
      country: 'US'
    },
    contactInfo: {
      email: 'admissions@teachforamerica.org',
      phone: '(800) 832-1230'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.0,
      financialScore: 86,
      accountabilityScore: 89
    },
    impact: {
      description: 'Recruiting teachers for under-resourced schools',
      metrics: [
        { name: 'Students Reached', value: '3000000', unit: 'students' }
      ]
    },
    donationInfo: {
      minimumAmount: 10,
      maximumAmount: 20000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  },
  {
    name: 'Planned Parenthood Federation',
    ein: '13-1644147',
    description: 'Delivering vital reproductive health care, education, and information.',
    category: 'HEALTH',
    subcategory: 'reproductive_health',
    website: 'https://www.plannedparenthood.org',
    address: {
      street: '123 William Street 10th Floor',
      city: 'New York',
      state: 'NY',
      zipCode: '10038',
      country: 'US'
    },
    contactInfo: {
      email: 'communications@ppfa.org',
      phone: '(212) 541-7800'
    },
    verification: {
      isVerified: true,
      verifiedBy: 'charity_navigator',
      verifiedAt: new Date(),
      rating: 4.2,
      financialScore: 89,
      accountabilityScore: 91
    },
    impact: {
      description: 'Providing essential health services',
      metrics: [
        { name: 'Patients Served', value: '2400000', unit: 'patients' }
      ]
    },
    donationInfo: {
      minimumAmount: 10,
      maximumAmount: 20000,
      suggestedAmounts: [25, 50, 100, 250, 500],
      acceptsRecurring: true
    },
    isFeatured: false
  }
];

// Sample users
const createUsers = async (companies) => {
  const users = [];
  
  for (const company of companies) {
    // Create HR admin
    const hrAdmin = await prisma.user.create({
      data: {
        email: `hr@${company.domain}`,
        password: await bcrypt.hash('password123', 10),
        firstName: 'HR',
        lastName: 'Admin',
        role: 'HR_ADMIN',
        companyId: company.id,
        employeeId: 'HR001',
        isActive: true,
        department: 'Human Resources',
        position: 'HR Manager',
        isVerified: true,
        preferences: {
          notifications: {
            email: true,
            sms: false,
            donationConfirmations: true,
            taxReminders: true,
            matchingUpdates: true
          },
          charityCategories: ['environment', 'education', 'health'],
          privacy: {
            showOnLeaderboard: false,
            shareDonationHistory: false
          }
        },
        gamification: {
          totalPoints: 0,
          badges: [],
          level: 1,
          totalDonated: 0,
          streakDays: 0
        }
      }
    });
    users.push(hrAdmin);
    
    // Create employees
    const employeeData = [
      { firstName: 'John', lastName: 'Doe', employeeId: 'EMP001', department: 'Engineering', position: 'Software Engineer' },
      { firstName: 'Jane', lastName: 'Smith', employeeId: 'EMP002', department: 'Marketing', position: 'Marketing Manager' },
      { firstName: 'Mike', lastName: 'Johnson', employeeId: 'EMP003', department: 'Sales', position: 'Sales Representative' },
      { firstName: 'Sarah', lastName: 'Wilson', employeeId: 'EMP004', department: 'Engineering', position: 'DevOps Engineer' },
      { firstName: 'David', lastName: 'Brown', employeeId: 'EMP005', department: 'Finance', position: 'Financial Analyst' }
    ];
    
    for (const emp of employeeData) {
      const user = await prisma.user.create({
        data: {
          email: `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@${company.domain}`,
          password: await bcrypt.hash('password123', 10),
          firstName: emp.firstName,
          lastName: emp.lastName,
          role: 'EMPLOYEE',
          companyId: company.id,
          employeeId: emp.employeeId,
          isActive: true,
          department: emp.department,
          position: emp.position,
          isVerified: true,
          preferences: {
            notifications: {
              email: true,
              sms: false,
              donationConfirmations: true,
              taxReminders: true,
              matchingUpdates: true
            },
            charityCategories: ['environment', 'education', 'health'],
            privacy: {
              showOnLeaderboard: Math.random() > 0.5,
              shareDonationHistory: Math.random() > 0.5
            }
          },
          gamification: {
            totalPoints: 0,
            badges: [],
            level: 1,
            totalDonated: 0,
            streakDays: 0
          }
        }
      });
      users.push(user);
    }
  }
  
  return users;
};

// Sample donations
const createDonations = async (users, charities) => {
  const donations = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const charity = charities[Math.floor(Math.random() * charities.length)];
    const amount = Math.floor(Math.random() * 500) + 10; // $10-$510
    
    // Skip HR admins for donations
    if (user.role === 'HR_ADMIN') continue;
    
    const donation = await prisma.donation.create({
      data: {
        userId: user.id,
        companyId: user.companyId,
        charityId: charity.id,
        amount: amount,
        matchingAmount: 0, // Will be calculated by company matching
        totalAmount: amount,
        type: Math.random() > 0.7 ? 'RECURRING' : 'ONE_TIME',
        frequency: Math.random() > 0.7 ? ['WEEKLY', 'MONTHLY', 'QUARTERLY'][Math.floor(Math.random() * 3)] : null,
        status: 'COMPLETED',
        paymentMethod: 'PAYROLL_DEDUCTION',
        payrollInfo: {
          deductionType: 'fixed_amount',
          deductionValue: amount,
          startDate: new Date(currentYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        },
        processingInfo: {
          processedAt: new Date()
        },
        taxInfo: {
          taxDeductible: true,
          taxYear: currentYear
        },
        createdAt: new Date(currentYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      }
    });
    
    donations.push(donation);
    
    // Update user gamification
    const newTotalDonated = user.gamification.totalDonated + amount;
    const newLevel = Math.floor(newTotalDonated / 100) + 1;
    const newPoints = user.gamification.totalPoints + Math.floor(amount);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        gamification: {
          ...user.gamification,
          totalPoints: newPoints,
          totalDonated: newTotalDonated,
          level: newLevel
        }
      }
    });
    
    // Update charity stats
    await prisma.charity.update({
      where: { id: charity.id },
      data: {
        totalDonations: {
          increment: parseFloat(amount)
        },
        totalDonors: {
          increment: 1
        }
      }
    });
  }
  
  return donations;
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await prisma.donation.deleteMany({});
    await prisma.taxRecord.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.charity.deleteMany({});
    await prisma.company.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Create companies
    console.log('🏢 Creating companies...');
    const createdCompanies = [];
    for (const companyData of companies) {
      const company = await prisma.company.create({
        data: companyData
      });
      createdCompanies.push(company);
    }
    console.log(`✅ Created ${createdCompanies.length} companies`);
    
    // Create charities
    console.log('❤️  Creating charities...');
    const createdCharities = [];
    for (const charityData of charities) {
      const charity = await prisma.charity.create({
        data: charityData
      });
      createdCharities.push(charity);
    }
    console.log(`✅ Created ${createdCharities.length} charities`);
    
    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await createUsers(createdCompanies);
    console.log(`✅ Created ${createdUsers.length} users`);
    
    // Create donations
    console.log('💰 Creating donations...');
    const createdDonations = await createDonations(createdUsers, createdCharities);
    console.log(`✅ Created ${createdDonations.length} donations`);
    
    // Update company matching amounts
    console.log('🔄 Updating company matching amounts...');
    for (const company of createdCompanies) {
      const companyDonations = await prisma.donation.findMany({ 
        where: { companyId: company.id } 
      });
      let totalMatching = 0;
      
      for (const donation of companyDonations) {
        // Calculate matching based on company settings
        const matchingProgram = company.matchingProgram;
        let matchingAmount = 0;
        
        if (matchingProgram.enabled) {
          if (matchingProgram.type === 'percentage') {
            matchingAmount = parseFloat(donation.amount) * (matchingProgram.percentage / 100);
          } else if (matchingProgram.type === 'fixed') {
            matchingAmount = matchingProgram.fixedAmount;
          }
          
          // Don't exceed annual limit
          const remainingBudget = matchingProgram.annualLimit - totalMatching;
          matchingAmount = Math.min(matchingAmount, remainingBudget);
        }
        
        await prisma.donation.update({
          where: { id: donation.id },
          data: {
            matchingAmount: matchingAmount,
            totalAmount: parseFloat(donation.amount) + matchingAmount
          }
        });
        
        totalMatching += matchingAmount;
      }
      
      await prisma.company.update({
        where: { id: company.id },
        data: {
          matchingProgram: {
            ...company.matchingProgram,
            usedAmount: totalMatching
          }
        }
      });
    }
    console.log('✅ Updated company matching amounts');
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Companies: ${createdCompanies.length}`);
    console.log(`   Charities: ${createdCharities.length}`);
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Donations: ${createdDonations.length}`);
    
    console.log('\n🔑 Test Accounts:');
    console.log('   HR Admin: hr@techcorp.com / password123');
    console.log('   Employee: john.doe@techcorp.com / password123');
    console.log('   Employee: jane.smith@techcorp.com / password123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
};

// Run seeding
connectDB().then(() => {
  seedDatabase();
});
