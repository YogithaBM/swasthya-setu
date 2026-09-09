export type Language = "en" | "hi";

export interface Translation {
  appName: string;
  appNameRoman: string;
  tagline: string;
  heroBadge: string;
  chooseRole: string;
  chooseRoleSub: string;
  enter: string;
  getStarted: string;
  language: string;
  theme: string;
  logout: string;
  /** Label of the language the user can switch TO (e.g. "हिन्दी" when in English). */
  switchTo: string;
  backHome: string;
  comingSoon: string;
  underConstruction: string;
  nav: {
    home: string;
    triage: string;
    facilities: string;
    availability: string;
    appointments: string;
    doctor: string;
    followups: string;
    referrals: string;
    labOrders: string;
    escalations: string;
    myRecords: string;
    /** Collapsed overflow menu ("More ▾") holding the low-priority doctor links. */
    moreMenu: string;
    asha: string;
  };
  roles: {
    patient: { title: string; description: string };
    doctor: { title: string; description: string };
    admin: { title: string; description: string };
  };
  login: {
    badge: string;
    title: string;
    description: string;
    patientTitle: string;
    patientDesc: string;
    patientCta: string;
    doctorTitle: string;
    doctorDesc: string;
    ashaTitle: string;
    ashaDesc: string;
    ashaCta: string;
    ashaPinHint: string;
    pinLabel: string;
    pinPlaceholder: string;
    unlockPanel: string;
    unlockAsha: string;
    wrongPin: string;
    pinHint: string;
    lockTitle: string;
    ashaLockTitle: string;
    locked: string;
    attemptsLeft: string;
  };
  accessDenied: {
    title: string;
    description: string;
    roleLabel: string;
    rolePatient: string;
    roleDoctor: string;
    roleAsha: string;
  };
  stats: {
    facilities: string;
    beds: string;
    availableBeds: string;
    doctors: string;
    patientsServed: string;
    appointmentsToday: string;
  };
  levels: {
    sub_centre: string;
    phc: string;
    rural_hospital: string;
    district_hospital: string;
  };
  networkCoverage: string;
  networkCoverageSub: string;
  /** Home hero: primary CTA and the small staff-login link below it. */
  bookAppointmentCta: string;
  staffLoginLink: string;
  /** Home page "How It Works" section. */
  howItWorks: {
    title: string;
    sub: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  footer: string;
  triage: {
    badge: string;
    title: string;
    description: string;
    inputTitle: string;
    inputHint: string;
    placeholder: string;
    examplesLabel: string;
    examples: [string, string, string];
    submit: string;
    emergencyTitle: string;
    loadingTitle: string;
    loadingSub: string;
    /** Shown after 10s while the fast local analysis takes over. */
    loadingQuickSub: string;
    errorTitle: string;
    resultLabel: string;
    sourceGemini: string;
    sourceOffline: string;
    reason: string;
    advice: string;
    recommendedFacility: string;
    bedsAvailable: string;
    bookAppointment: string;
    emergencyStrip: string;
  };
  facilities: {
    badge: string;
    title: string;
    description: string;
    mapTitle: string;
    mapSub: string;
    legendTitle: string;
    searchPlaceholder: string;
    tableTitle: string;
    colName: string;
    colType: string;
    colDoctors: string;
    colBeds: string;
    colMedicines: string;
    bedsFree: string;
    legendGood: string;
    legendFair: string;
    legendLow: string;
    noResults: string;
  };
  availability: {
    badge: string;
    title: string;
    description: string;
    totalBeds: string;
    availableBeds: string;
    totalMedicines: string;
    unitsInStock: string;
    lowStockAlerts: string;
    refreshData: string;
    refreshing: string;
    updated: string;
    bedGridTitle: string;
    bedGridSub: string;
    medicineStockTitle: string;
    medicineStockSub: string;
    allFacilities: string;
    colMedicine: string;
    colFacility: string;
    colStock: string;
    colStatus: string;
    statusInStock: string;
    statusLow: string;
    statusOut: string;
    noResults: string;
    dashboard: {
      alertsTitle: string;
      allOperational: string;
      alertIcu: string;
      alertStock: string;
      avgWait: string;
      patientsToday: string;
      referralsCompleted: string;
      followupsDue: string;
      minutesShort: string;
      facilityHealth: string;
      facilityHealthSub: string;
      bedOccupancy: string;
      medicineStock: string;
      patientsServed: string;
      statusHealthy: string;
      statusAttention: string;
      statusCritical: string;
      weekTitle: string;
      weekSub: string;
      patientsUnit: string;
    };
  };
  appointments: {
    badge: string;
    title: string;
    description: string;
    formTitle: string;
    formSub: string;
    facilityLabel: string;
    facilityPlaceholder: string;
    dateLabel: string;
    timeLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    bookButton: string;
    errorFacility: string;
    errorDate: string;
    errorTime: string;
    errorName: string;
    errorPhone: string;
    nameMin: string;
    nameMax: string;
    nameInvalid: string;
    phoneRequired: string;
    phoneInvalid: string;
    toastError: string;
    confirmationTitle: string;
    confirmationSub: string;
    queueMessage: string;
    waitTime: string;
    waitMinutes: string;
    selectedDate: string;
    selectedTime: string;
    bookAnother: string;
    todayAppointments: string;
    todaySub: string;
    colPatient: string;
    colFacility: string;
    colTime: string;
    colQueue: string;
    colStatus: string;
    statusWaiting: string;
    statusCompleted: string;
    filterAll: string;
    newTag: string;
    noAppointments: string;
    noAppointmentsToday: string;
  };
  doctor: {
    badge: string;
    title: string;
    description: string;
    queueTitle: string;
    queueSub: string;
    queueEmpty: string;
    waitingWord: string;
    minutesUnit: string;
    emptyTitle: string;
    emptySub: string;
    patientDetails: string;
    patientLabel: string;
    doctorLabel: string;
    ageLabel: string;
    ageUnit: string;
    symptomsLabel: string;
    severityLabel: string;
    formTitle: string;
    diagnosis: string;
    diagPlaceholder: string;
    medicinesLabel: string;
    medName: string;
    medNamePh: string;
    dosage: string;
    dosagePh: string;
    frequency: string;
    duration: string;
    durationPh: string;
    addMedicine: string;
    removeMedicine: string;
    notes: string;
    notesPlaceholder: string;
    urgency: string;
    savePrescription: string;
    errorDiagnosis: string;
    errorMedicine: string;
    errorMedicineMin: string;
    frequencies: {
      once: string;
      twice: string;
      thrice: string;
      asNeeded: string;
    };
    doctorName: string;
    cardHeader: string;
    qrText: string;
    print: string;
    sendToPatient: string;
    sending: string;
    sent: string;
    /** "Prescription sent to {name}" — name is substituted at render time. */
    sentToastNamed: string;
    sentToast: string;
    newPrescription: string;
    markCompleted: string;
    completedToast: string;
    orderTests: string;
    orderTestsSub: string;
    labToast: string;
    pastVisits: string;
    noHistory: string;
    scheduleFollowup: string;
    followupDate: string;
    referTarget: string;
    referTargetPh: string;
    referError: string;
    followUpError: string;
    followupToast: string;
    referralToast: string;
  };
  followup: {
    badge: string;
    title: string;
    description: string;
    colPatient: string;
    colDiagnosis: string;
    colDate: string;
    colFacility: string;
    colStatus: string;
    statusOverdue: string;
    statusToday: string;
    statusUpcoming: string;
    noFollowups: string;
  };
  /** Shared label strings for "Completed" across the doctor panel and pages. */
  common: {
    completedStatus: string;
    completedToday: string;
    noCompletedYet: string;
  };
  referrals: {
    badge: string;
    title: string;
    description: string;
    colPatient: string;
    colFrom: string;
    colTo: string;
    colDate: string;
    colReason: string;
    colStatus: string;
    statusPending: string;
    statusInTransit: string;
    statusCompleted: string;
    noReferrals: string;
    updated: string;
  };
  labOrders: {
    badge: string;
    title: string;
    description: string;
    colPatient: string;
    colTests: string;
    colFacility: string;
    colDate: string;
    colStatus: string;
    statusPending: string;
    statusCompleted: string;
    colResult: string;
    markComplete: string;
    completedToast: string;
    noOrders: string;
    updated: string;
  };
  escalation: {
    badge: string;
    title: string;
    description: string;
    colPatient: string;
    colSymptoms: string;
    colFacility: string;
    colTime: string;
    colStatus: string;
    statusEscalated: string;
    statusResolved: string;
    noEscalations: string;
    notifiedBanner: string;
    notFound: string;
    updated: string;
  };
  myRecords: {
    badge: string;
    title: string;
    description: string;
    phoneLabel: string;
    phonePlaceholder: string;
    findRecords: string;
    notFound: string;
    visitsSection: string;
    noVisits: string;
    followupsSection: string;
    noFollowups: string;
    labsSection: string;
    noLabs: string;
    appointmentsSection: string;
    noAppointments: string;
    emergenciesSection: string;
    noEmergencies: string;
    labStatusPending: string;
    labStatusCompleted: string;
    referralsSection: string;
    noReferrals: string;
    note: string;
  };
  asha: {
    badge: string;
    title: string;
    description: string;
    registerTitle: string;
    registerSub: string;
    nameLabel: string;
    namePh: string;
    phoneLabel: string;
    phonePh: string;
    ageLabel: string;
    agePh: string;
    genderLabel: string;
    genderMale: string;
    genderFemale: string;
    genderOther: string;
    villageLabel: string;
    villagePh: string;
    symptomsLabel: string;
    symptomsPh: string;
    facilityLabel: string;
    facilityPh: string;
    registerButton: string;
    registeredToast: string;
    myPatients: string;
    myPatientsSub: string;
    noPatients: string;
    quickTriage: string;
    referDoctor: string;
    referredChip: string;
    referredToast: string;
    noSymptomsHint: string;
    severityLabel: string;
  };
  bedTypes: {
    general: string;
    icu: string;
    maternity: string;
  };
}

export const translations: Record<Language, Translation> = {
  en: {
    appName: "स्वास्थ्य सेतु",
    appNameRoman: "Swasthya Setu",
    tagline: "Connecting Rural India to Quality Healthcare",
    heroBadge: "Rural Healthcare Network · Maharashtra",
    chooseRole: "Choose Your Role",
    chooseRoleSub: "Select how you'd like to use Swasthya Setu",
    enter: "Enter",
    getStarted: "Get Started",
    language: "Language",
    theme: "Theme",
    logout: "Logout",
    switchTo: "हिन्दी",
    backHome: "Back to Home",
    comingSoon: "Coming Soon",
    underConstruction:
      "This module is under construction as part of the Swasthya Setu initiative and will be available soon.",
    nav: {
      home: "Home",
      triage: "Triage",
      facilities: "Facilities",
      availability: "Bed Availability",
      appointments: "Appointments",
      doctor: "Doctor",
      followups: "Follow-ups",
      referrals: "Referrals",
      labOrders: "Lab Orders",
      escalations: "Escalations",
      myRecords: "My Records",
      moreMenu: "More",
      asha: "My Patients",
    },
    roles: {
      patient: {
        title: "Patient",
        description: "Book appointments and find the nearest health facility.",
      },
      doctor: {
        title: "Doctor",
        description: "Manage patients and monitor bed and medicine availability.",
      },
      admin: {
        title: "Administrator",
        description: "Oversee facilities, beds, and medicine stock across the network.",
      },
    },
    login: {
      badge: "Secure Access",
      title: "Login",
      description: "Choose how you'd like to use Swasthya Setu",
      patientTitle: "I am a Patient",
      patientDesc:
        "Check your symptoms, find nearby health centers and book appointments.",
      patientCta: "Continue to Triage",
      doctorTitle: "I am a Doctor",
      doctorDesc:
        "Unlock the doctor panel to manage the patient queue and issue prescriptions.",
      ashaTitle: "I am an ASHA Worker",
      ashaDesc:
        "Register patients in your village, triage symptoms and refer them to a doctor.",
      ashaCta: "Open ASHA Dashboard",
      ashaPinHint: "Demo PIN: 5678",
      pinLabel: "Staff PIN",
      pinPlaceholder: "Enter 4-digit PIN",
      unlockPanel: "Unlock Doctor Panel",
      unlockAsha: "Unlock ASHA Dashboard",
      wrongPin: "गलत PIN / Wrong PIN",
      pinHint: "Demo PIN: 1234",
      lockTitle: "Doctor login temporarily locked",
      ashaLockTitle: "ASHA login temporarily locked",
      locked: "Too many wrong attempts — try again in {n}s",
      attemptsLeft: "{n} attempts left",
    },
    accessDenied: {
      title: "Access Denied",
      description: "You do not have permission to view this page.",
      roleLabel: "Logged in as",
      rolePatient: "Patient",
      roleDoctor: "Doctor",
      roleAsha: "ASHA Worker",
    },
    stats: {
      facilities: "Health Facilities",
      beds: "Total Beds",
      availableBeds: "Available Beds",
      doctors: "Doctors",
      patientsServed: "Patients Served",
      appointmentsToday: "Appointments Today",
    },
    levels: {
      sub_centre: "Sub-Centre",
      phc: "Primary Health Centre (PHC)",
      rural_hospital: "Rural Hospital",
      district_hospital: "District Hospital",
    },
    networkCoverage: "Network Coverage",
    networkCoverageSub: "Our facilities across Amravati district",
    bookAppointmentCta: "Book Appointment",
    staffLoginLink: "Are you a doctor? Staff Login →",
    howItWorks: {
      title: "How It Works",
      sub: "From symptoms to treatment in three simple steps",
      step1Title: "Describe Your Symptoms",
      step1Desc:
        "AI triage understands your complaint and recommends the right facility — sub-centre, PHC or hospital.",
      step2Title: "Find Available Beds & Medicine",
      step2Desc:
        "See real-time bed and medicine availability across all 6 facilities before you travel.",
      step3Title: "Book & Visit",
      step3Desc:
        "Book your slot online and get an instant queue number — no waiting in line at the counter.",
    },
    footer: "© 2025 Swasthya Setu | SIH26133 | Govt. of Maharashtra",
    triage: {
      badge: "Digital Triage",
      title: "Digital Triage",
      description: "Describe your symptoms and get directed to the right health facility.",
      inputTitle: "Describe Your Symptoms",
      inputHint: "Write in Hindi or English",
      placeholder: "Tell us your problem... (e.g., fever and headache for 2 days)",
      examplesLabel: "Examples:",
      examples: [
        "Fever and headache for 2 days",
        "High fever, vomiting and stomach pain for 3 days",
        "Severe chest pain and difficulty breathing",
      ],
      submit: "Check Facility",
      emergencyTitle: "🚨 Emergency Detected — Escalating to District Hospital",
    loadingTitle: "Analyzing symptoms...",
    loadingSub: "Analyzing symptoms with AI",
    /** Shown after 10s while the fast local analysis takes over. */
    loadingQuickSub: "Using quick analysis...",
      errorTitle: "Error",
      resultLabel: "Triage Result",
      sourceGemini: "Gemini AI",
      sourceOffline: "Offline Triage",
      reason: "Reason",
      advice: "Quick Advice",
      recommendedFacility: "Recommended Facility",
      bedsAvailable: "beds available",
      bookAppointment: "Book Appointment",
      emergencyStrip:
        "For emergency help, dial 108 ambulance immediately or go directly to the nearest District Hospital. Do not travel alone.",
    },
    facilities: {
      badge: "Health Network Map",
      title: "Find Health Centers",
      description:
        "Explore all six health facilities across Amravati district and check live bed availability at a glance.",
      mapTitle: "Facility Map",
      mapSub: "Click a marker to see facility details, doctors and free beds.",
      legendTitle: "Facility Types",
      searchPlaceholder: "Search by name, type or district…",
      tableTitle: "All Facilities",
      colName: "Name",
      colType: "Type",
      colDoctors: "Doctors",
      colBeds: "Beds Available",
      colMedicines: "Medicines",
      bedsFree: "free",
      legendGood: ">50% free",
      legendFair: "25–50% free",
      legendLow: "<25% free",
      noResults: "No facility matches your search. Try a different keyword.",
    },
    availability: {
      badge: "Live Dashboard",
      title: "Bed & Medicine Availability",
      description:
        "Real-time bed and medicine availability across the Amravati health network.",
      totalBeds: "Total Beds",
      availableBeds: "Available Beds",
      totalMedicines: "Total Medicines",
      unitsInStock: "units in stock",
      lowStockAlerts: "Low Stock Alerts",
      refreshData: "Refresh Data",
      refreshing: "Refreshing…",
      updated: "Data updated",
      bedGridTitle: "Bed Availability by Facility",
      bedGridSub: "Free bed percentage per ward type",
      medicineStockTitle: "Medicine Stock",
      medicineStockSub: "Click a column header to sort",
      allFacilities: "All Facilities",
      colMedicine: "Medicine Name",
      colFacility: "Facility",
      colStock: "Stock Level",
      colStatus: "Status",
      statusInStock: "In Stock",
      statusLow: "Low Stock",
      statusOut: "Out of Stock",
      noResults: "No medicines match the current filter.",
      dashboard: {
        alertsTitle: "Live Network Alerts",
        allOperational: "All facilities operational",
        alertIcu: "ICU beds 90% full",
        alertStock: "Paracetamol low stock",
        avgWait: "Avg Wait Time",
        patientsToday: "Patients Today",
        referralsCompleted: "Referrals Completed",
        followupsDue: "Follow-ups Due",
        minutesShort: "min",
        facilityHealth: "Facility Health",
        facilityHealthSub: "Live bed and medicine readiness across the network",
        bedOccupancy: "Bed Occupancy",
        medicineStock: "Medicine Stock",
        patientsServed: "Patients Served Today",
        statusHealthy: "Healthy",
        statusAttention: "Attention",
        statusCritical: "Critical",
        weekTitle: "Patients This Week",
        weekSub: "Daily footfall across the Amravati network (sample data)",
        patientsUnit: "patients",
      },
    },
    appointments: {
      badge: "OPD Scheduling",
      title: "Book Appointment",
      description: "Schedule an appointment at the health facility of your choice.",
      formTitle: "Appointment Details",
      formSub: "Fill in the details to book your slot",
      facilityLabel: "Health Facility",
      facilityPlaceholder: "Select a facility…",
      dateLabel: "Date",
      timeLabel: "Time Slot",
      nameLabel: "Patient Name",
      namePlaceholder: "Full name",
      phoneLabel: "Phone Number",
      phonePlaceholder: "10-digit mobile number",
      bookButton: "Book Appointment",
      errorFacility: "Please select a health facility.",
      errorDate: "Please select a valid date (today or up to 30 days ahead).",
      errorTime: "Please select a time slot.",
      errorName: "Please enter the patient's name.",
      errorPhone: "Please enter a valid 10-digit mobile number.",
      nameMin: "Name must be at least 3 characters.",
      nameMax: "Name cannot exceed 100 characters.",
      nameInvalid: "Use only letters, spaces and basic punctuation.",
      phoneRequired: "Phone number is required.",
      phoneInvalid: "Please enter a valid 10-digit mobile number.",
      toastError: "Please fix the highlighted fields and try again.",
      confirmationTitle: "Appointment Confirmed",
      confirmationSub: "Your slot has been booked successfully",
      queueMessage: "You're #{n} in queue",
      waitTime: "Estimated Wait Time",
      waitMinutes: "~{n} minutes",
      selectedDate: "Date",
      selectedTime: "Time",
      bookAnother: "Book Another",
      todayAppointments: "Today's Appointments",
      todaySub: "Live queue across health facilities",
      colPatient: "Patient Name",
      colFacility: "Facility",
      colTime: "Time",
      colQueue: "Queue #",
      colStatus: "Status",
      statusWaiting: "Waiting",
      statusCompleted: "Completed",
      filterAll: "All",
      newTag: "New",
      noAppointments: "No appointments match this filter.",
      noAppointmentsToday: "No appointments today. Book one to get started →",
    },
    doctor: {
      badge: "Doctor Panel",
      title: "Doctor Panel",
      description: "Manage the patient queue and issue digital prescriptions.",
      queueTitle: "Patient Queue",
      queueSub: "Emergency first, then attention and safe cases",
      queueEmpty: "No waiting patients — the queue is clear.",
      waitingWord: "waiting",
      minutesUnit: "min",
      emptyTitle: "Select a Patient",
      emptySub: "Choose a patient from the queue to start a prescription.",
      patientDetails: "Patient Details",
      patientLabel: "Patient",
      doctorLabel: "Doctor",
      ageLabel: "Age",
      ageUnit: "yrs",
      symptomsLabel: "Symptoms",
      severityLabel: "Severity",
      formTitle: "New Prescription",
      diagnosis: "Diagnosis",
      diagPlaceholder: "e.g., Viral fever with dehydration",
      medicinesLabel: "Medicines",
      medName: "Medicine Name",
      medNamePh: "e.g., Paracetamol",
      dosage: "Dosage",
      dosagePh: "e.g., 500mg",
      frequency: "Frequency",
      duration: "Duration",
      durationPh: "e.g., 5 days",
      addMedicine: "Add Medicine",
      removeMedicine: "Remove",
      notes: "Doctor's Notes",
      notesPlaceholder: "Rest, drink plenty of fluids, and return if symptoms worsen…",
      urgency: "Refer to higher facility",
      savePrescription: "Save Prescription",
      errorDiagnosis: "Please enter a diagnosis.",
      errorMedicine: "Each medicine needs a name and dosage.",
      errorMedicineMin: "Add at least one medicine with a name and dosage.",
      frequencies: {
        once: "Once daily",
        twice: "Twice daily",
        thrice: "Three times daily",
        asNeeded: "As needed",
      },
      doctorName: "Dr. Sharma",
      cardHeader: "Swasthya Setu - Health Bridge",
      qrText: "Scan for digital copy",
      print: "Print",
      sendToPatient: "Send to Patient",
      sending: "Sending...",
      sent: "✓ Sent",
      sentToastNamed: "Prescription sent to {name}",
      sentToast: "Prescription sent to patient's phone",
      newPrescription: "New Prescription",
      markCompleted: "Mark Completed",
      completedToast: "Appointment marked as completed",
      orderTests: "Order Lab Tests",
      orderTestsSub: "Select tests to order for this patient",
      labToast: "Lab order placed for {n} test(s)",
      pastVisits: "Past Visits",
      noHistory: "No past visits recorded for this patient yet.",
      scheduleFollowup: "Schedule Follow-up",
      followupDate: "Follow-up Date",
      referTarget: "Refer To",
      referTargetPh: "Select target facility…",
      referError: "Please select a target facility for the referral.",
      followUpError: "Please select a follow-up date.",
      followupToast: "Follow-up scheduled for {date}",
      referralToast: "Referral to {facility} created",
    },
    bedTypes: {
      general: "General Ward",
      icu: "ICU",
      maternity: "Maternity Ward",
    },
    labOrders: {
      badge: "Diagnostics",
      title: "Lab Orders",
      description: "Track lab tests ordered for patients, from sample collection to results.",
      colPatient: "Patient",
      colTests: "Tests",
      colFacility: "Facility",
      colDate: "Date",
      colStatus: "Status",
      statusPending: "Pending",
      statusCompleted: "Completed",
      colResult: "Result",
      markComplete: "Mark Complete",
      completedToast: "Lab test marked complete",
      noOrders: "No lab orders yet. Orders created from the doctor panel will appear here.",
      updated: "Lab order status updated",
    },
    escalation: {
      badge: "Emergency Response",
      title: "Emergency Escalations",
      description: "Red-severity triage cases automatically escalated to the district emergency network.",
      colPatient: "Patient",
      colSymptoms: "Symptoms",
      colFacility: "Escalated To",
      colTime: "Time",
      colStatus: "Status",
      statusEscalated: "Escalated",
      statusResolved: "Resolved",
      noEscalations: "No emergencies escalated yet. Red-severity triage results appear here automatically.",
      notifiedBanner: "Emergency Contact Notified",
      notFound: "No escalated cases found.",
      updated: "Escalation status updated",
    },
    myRecords: {
      badge: "Personal Health",
      title: "My Records",
      description: "Enter your mobile number to see your visits, prescriptions, lab results and follow-ups.",
      phoneLabel: "Mobile Number",
      phonePlaceholder: "10-digit mobile number",
      findRecords: "Find My Records",
      notFound: "No records found for this number. Book an appointment or visit a facility to create your health record.",
      visitsSection: "Past Visits & Prescriptions",
      noVisits: "No past visits yet.",
      followupsSection: "Upcoming Follow-ups",
      noFollowups: "No upcoming follow-ups.",
      labsSection: "Lab Tests",
      noLabs: "No lab tests ordered.",
      appointmentsSection: "Appointments",
      noAppointments: "No appointments booked.",
      emergenciesSection: "Emergency Escalations",
      noEmergencies: "No emergency escalations.",
      labStatusPending: "Pending",
      labStatusCompleted: "Completed",
      referralsSection: "Active Referrals",
      noReferrals: "No active referrals.",
      note: "Demo tip: try 9876543210 (Nischitha's number from a booked appointment).",
    },
    asha: {
      badge: "Community Health",
      title: "ASHA Worker Dashboard",
      description:
        "Register patients in your village, run a quick triage and refer them to a doctor.",
      registerTitle: "Register New Patient",
      registerSub: "Enter the patient's details to add them to your list",
      nameLabel: "Patient Name",
      namePh: "Full name",
      phoneLabel: "Phone Number",
      phonePh: "10-digit mobile number",
      ageLabel: "Age",
      agePh: "Age in years",
      genderLabel: "Gender",
      genderMale: "Male",
      genderFemale: "Female",
      genderOther: "Other",
      villageLabel: "Village",
      villagePh: "e.g., Shelgaon",
      symptomsLabel: "Symptoms",
      symptomsPh: "e.g., fever and headache for 2 days",
      facilityLabel: "Assigned Facility",
      facilityPh: "Select a health facility…",
      registerButton: "Register Patient",
      registeredToast: "Patient registered successfully",
      myPatients: "My Patients",
      myPatientsSub: "Patients you have registered in your community",
      noPatients: "No patients registered yet. Use the form above to add your first patient.",
      quickTriage: "Quick Triage",
      referDoctor: "Refer to Doctor",
      referredChip: "Referred",
      referredToast: "Appointment created — queue #{n}",
      noSymptomsHint: "Add symptoms to enable triage and referral",
      severityLabel: "Severity",
    },
    followup: {
      badge: "Follow-Up Care",
      title: "Follow-up Schedule",
      description:
        "High-risk patients scheduled for follow-up visits across the network.",
      colPatient: "Patient",
      colDiagnosis: "Diagnosis",
      colDate: "Follow-up Date",
      colFacility: "Facility",
      colStatus: "Status",
      statusOverdue: "Overdue",
      statusToday: "Due Today",
      statusUpcoming: "Upcoming",
      noFollowups: "No follow-ups scheduled yet. Schedule one from the doctor panel.",
    },
    common: {
      completedStatus: "Completed",
      completedToday: "Completed Today",
      noCompletedYet: "No patients completed yet today.",
    },
    referrals: {
      badge: "Referral Tracking",
      title: "Referrals",
      description: "Track patients referred to higher-level facilities across the network.",
      colPatient: "Patient",
      colFrom: "From",
      colTo: "To",
      colDate: "Date",
      colReason: "Reason",
      colStatus: "Status",
      statusPending: "Pending",
      statusInTransit: "In-Transit",
      statusCompleted: "Completed",
      noReferrals: "No referrals yet. Referrals created from the doctor panel will appear here.",
      updated: "Referral status updated",
    },
  },
  hi: {
    appName: "स्वास्थ्य सेतु",
    appNameRoman: "Swasthya Setu",
    tagline: "ग्रामीण भारत को गुणवत्तापूर्ण स्वास्थ्य सेवाओं से जोड़ना",
    heroBadge: "महाराष्ट्र · ग्रामीण स्वास्थ्य नेटवर्क",
    chooseRole: "अपनी भूमिका चुनें",
    chooseRoleSub: "स्वास्थ्य सेतु का उपयोग शुरू करने के लिए अपनी भूमिका चुनें",
    enter: "प्रवेश करें",
    getStarted: "शुरू करें",
    language: "भाषा",
    theme: "थीम",
    logout: "लॉग आउट",
    switchTo: "English",
    backHome: "होम पर वापस जाएँ",
    comingSoon: "जल्द आ रहा है",
    underConstruction:
      "यह मॉड्यूल स्वास्थ्य सेतु पहल के अंतर्गत निर्माणाधीन है और जल्द ही उपलब्ध होगा।",
    nav: {
      home: "होम",
      triage: "ट्राइएज",
      facilities: "स्वास्थ्य सुविधाएँ",
      availability: "बिस्तर उपलब्धता",
      appointments: "अपॉइंटमेंट",
      doctor: "डॉक्टर",
      followups: "फॉलो-अप",
      referrals: "रेफ़रल",
      labOrders: "लैब ऑर्डर",
      escalations: "एस्कलेशन",
      myRecords: "मेरे रिकॉर्ड",
      moreMenu: "और",
      asha: "मेरे मरीज़",
    },
    roles: {
      patient: {
        title: "मरीज़",
        description: "अपॉइंटमेंट बुक करें और नज़दीकी स्वास्थ्य केंद्र का पता लगाएँ।",
      },
      doctor: {
        title: "डॉक्टर",
        description: "मरीज़ों का प्रबंधन करें और बिस्तर व दवाओं की उपलब्धता देखें।",
      },
      admin: {
        title: "प्रशासक",
        description: "सभी स्वास्थ्य केंद्रों, बिस्तरों और दवाओं के स्टॉक पर नज़र रखें।",
      },
    },
    login: {
      badge: "सुरक्षित प्रवेश",
      title: "लॉगिन",
      description: "स्वास्थ्य सेतु का उपयोग शुरू करने का तरीका चुनें",
      patientTitle: "मैं मरीज़ हूँ",
      patientDesc:
        "अपने लक्षण जाँचें, नज़दीकी स्वास्थ्य केंद्र खोजें और अपॉइंटमेंट बुक करें।",
      patientCta: "ट्राइएज पर जाएँ",
      doctorTitle: "मैं डॉक्टर हूँ",
      doctorDesc:
        "मरीज़ कतार प्रबंधित करने और प्रिस्क्रिप्शन जारी करने के लिए डॉक्टर पैनल खोलें।",
      ashaTitle: "मैं आशा कार्यकर्ता हूँ",
      ashaDesc:
        "गाँव के मरीज़ों को पंजीकृत करें, लक्षण जाँचें और डॉक्टर के पास रेफ़र करें।",
      ashaCta: "आशा डैशबोर्ड खोलें",
      ashaPinHint: "डेमो पिन: 5678",
      pinLabel: "स्टाफ पिन",
      pinPlaceholder: "4 अंकों का पिन दर्ज करें",
      unlockPanel: "डॉक्टर पैनल खोलें",
      unlockAsha: "आशा डैशबोर्ड खोलें",
      wrongPin: "गलत PIN / Wrong PIN",
      pinHint: "डेमो पिन: 1234",
      lockTitle: "डॉक्टर लॉगिन अस्थायी रूप से लॉक है",
      ashaLockTitle: "आशा लॉगिन अस्थायी रूप से लॉक है",
      locked: "कई गलत प्रयास — {n} सेकंड बाद फिर कोशिश करें",
      attemptsLeft: "{n} प्रयास शेष",
    },
    accessDenied: {
      title: "आपके पास अनुमति नहीं है",
      description: "आपके पास यह पेज देखने की अनुमति नहीं है।",
      roleLabel: "लॉग इन है",
      rolePatient: "मरीज़",
      roleDoctor: "डॉक्टर",
      roleAsha: "आशा कार्यकर्ता",
    },
    stats: {
      facilities: "स्वास्थ्य केंद्र",
      beds: "कुल बिस्तर",
      availableBeds: "उपलब्ध बिस्तर",
      doctors: "डॉक्टर",
      patientsServed: "इलाज किए मरीज़",
      appointmentsToday: "आज के अपॉइंटमेंट",
    },
    levels: {
      sub_centre: "उप-केंद्र",
      phc: "प्राथमिक स्वास्थ्य केंद्र (पीएचसी)",
      rural_hospital: "ग्रामीण अस्पताल",
      district_hospital: "जिला अस्पताल",
    },
    networkCoverage: "नेटवर्क कवरेज",
    networkCoverageSub: "अमरावती जिले में हमारे स्वास्थ्य केंद्र",
    bookAppointmentCta: "अपॉइंटमेंट बुक करें",
    staffLoginLink: "क्या आप डॉक्टर हैं? स्टाफ लॉगिन →",
    howItWorks: {
      title: "यह कैसे काम करता है",
      sub: "लक्षणों से इलाज तक — तीन आसान चरण",
      step1Title: "अपनी तकलीफ बताएं",
      step1Desc:
        "AI ट्राइएज आपकी शिकायत समझकर सही स्वास्थ्य केंद्र सुझाता है — उप-केंद्र, PHC या अस्पताल।",
      step2Title: "बिस्तर और दवा उपलब्धता देखें",
      step2Desc:
        "जाने से पहले सभी 6 केंद्रों में बिस्तर और दवा की रीयल-टाइम उपलब्धता देखें।",
      step3Title: "बुक करें और आएं",
      step3Desc:
        "ऑनलाइन स्लॉट बुक करें और तुरंत कतार नंबर पाएं — काउंटर पर लाइन में खड़े होने की ज़रूरत नहीं।",
    },
    footer: "© 2025 स्वास्थ्य सेतु | SIH26133 | महाराष्ट्र शासन",
    triage: {
      badge: "डिजिटल ट्राइएज",
      title: "रोग की जांच",
      description: "अपने लक्षण लिखें — सिस्टम आपको सही स्वास्थ्य केंद्र तक पहुँचाएगा।",
      inputTitle: "अपने लक्षण बताएँ",
      inputHint: "हिंदी या अंग्रेज़ी में लिखें",
      placeholder: "अपनी तकलीफ बताएं... (e.g., बुखार और सिरदर्द है 2 दिन से)",
      examplesLabel: "उदाहरण:",
      examples: [
        "बुखार और सिरदर्द है 2 दिन से",
        "तेज़ बुखार, उल्टी और पेट में दर्द 3 दिन से",
        "छाती में तेज़ दर्द और साँस लेने में तकलीफ",
      ],
      submit: "सुविधा जाँचें",
      emergencyTitle: "🚨 आपातकाल पाया गया — जिला अस्पताल को सूचित किया जा रहा है",
      loadingTitle: "लक्षणों का विश्लेषण हो रहा है...",
      loadingSub: "एआई की मदद से लक्षणों का विश्लेषण हो रहा है",
      loadingQuickSub: "तेज़ स्थानीय विश्लेषण का उपयोग हो रहा है...",
      errorTitle: "त्रुटि",
      resultLabel: "परिणाम",
      sourceGemini: "जेमिनी एआई",
      sourceOffline: "ऑफ़लाइन ट्राइएज",
      reason: "कारण",
      advice: "सलाह",
      recommendedFacility: "अनुशंसित सुविधा",
      bedsAvailable: "बिस्तर उपलब्ध",
      bookAppointment: "अपॉइंटमेंट बुक करें",
      emergencyStrip:
        "आपातकालीन सहायता के लिए तुरंत 108 एम्बुलेंस डायल करें या सीधे नज़दीकी जिला अस्पताल जाएँ। अकेले यात्रा न करें।",
    },
    facilities: {
      badge: "स्वास्थ्य नेटवर्क का नक्शा",
      title: "स्वास्थ्य केंद्र खोजें",
      description:
        "अमरावती जिले के सभी छह स्वास्थ्य केंद्रों को देखें और बिस्तरों की उपलब्धता एक नज़र में जानें।",
      mapTitle: "स्वास्थ्य केंद्रों का नक्शा",
      mapSub: "विवरण, डॉक्टर और खाली बिस्तर देखने के लिए मार्कर पर क्लिक करें।",
      legendTitle: "सुविधा के प्रकार",
      searchPlaceholder: "नाम, प्रकार या जिले से खोजें…",
      tableTitle: "सभी स्वास्थ्य केंद्र",
      colName: "नाम",
      colType: "प्रकार",
      colDoctors: "डॉक्टर",
      colBeds: "उपलब्ध बिस्तर",
      colMedicines: "दवाएँ",
      bedsFree: "खाली",
      legendGood: "50% से अधिक खाली",
      legendFair: "25–50% खाली",
      legendLow: "25% से कम खाली",
      noResults: "कोई स्वास्थ्य केंद्र आपकी खोज से मेल नहीं खाता। दूसरा कीवर्ड आज़माएँ।",
    },
    availability: {
      badge: "लाइव डैशबोर्ड",
      title: "बिस्तर और दवा उपलब्धता",
      description: "अमरावती स्वास्थ्य नेटवर्क में बिस्तरों और दवाओं की वास्तविक समय उपलब्धता।",
      totalBeds: "कुल बिस्तर",
      availableBeds: "उपलब्ध बिस्तर",
      totalMedicines: "कुल दवाएँ",
      unitsInStock: "यूनिट स्टॉक में",
      lowStockAlerts: "कम स्टॉक अलर्ट",
      refreshData: "डेटा रीफ़्रेश करें",
      refreshing: "रीफ़्रेश हो रहा है…",
      updated: "डेटा अपडेट हो गया",
      bedGridTitle: "सुविधा अनुसार बिस्तर उपलब्धता",
      bedGridSub: "प्रत्येक वार्ड प्रकार में खाली बिस्तरों का प्रतिशत",
      medicineStockTitle: "दवा स्टॉक",
      medicineStockSub: "कॉलम हेडर पर क्लिक करके क्रमबद्ध करें",
      allFacilities: "सभी सुविधाएँ",
      colMedicine: "दवा का नाम",
      colFacility: "सुविधा",
      colStock: "स्टॉक स्तर",
      colStatus: "स्थिति",
      statusInStock: "स्टॉक में",
      statusLow: "कम स्टॉक",
      statusOut: "स्टॉक खत्म",
      noResults: "मौजूदा फ़िल्टर से कोई दवा मेल नहीं खाती।",
      dashboard: {
        alertsTitle: "लाइव नेटवर्क अलर्ट",
        allOperational: "सभी सुविधाएँ चालू हैं",
        alertIcu: "ICU बिस्तर 90% भरे हुए",
        alertStock: "पैरासिटामोल स्टॉक कम",
        avgWait: "औसत प्रतीक्षा समय",
        patientsToday: "आज के मरीज़",
        referralsCompleted: "पूर्ण रेफ़रल",
        followupsDue: "बकाया फॉलो-अप",
        minutesShort: "मिनट",
        facilityHealth: "सुविधा स्वास्थ्य",
        facilityHealthSub: "पूरे नेटवर्क में लाइव बिस्तर व दवा तत्परता",
        bedOccupancy: "बिस्तर अधिभोग",
        medicineStock: "दवा स्टॉक",
        patientsServed: "आज सेवा प्राप्त मरीज़",
        statusHealthy: "स्वस्थ",
        statusAttention: "ध्यान दें",
        statusCritical: "गंभीर",
        weekTitle: "इस सप्ताह के मरीज़",
        weekSub: "अमरावती नेटवर्क में दैनिक आवक (नमूना डेटा)",
        patientsUnit: "मरीज़",
      },
    },
    appointments: {
      badge: "ओपीडी शेड्यूलिंग",
      title: "अपॉइंटमेंट बुक करें",
      description: "अपनी पसंद के स्वास्थ्य केंद्र पर अपॉइंटमेंट बुक करें।",
      formTitle: "अपॉइंटमेंट विवरण",
      formSub: "अपना स्लॉट बुक करने के लिए विवरण भरें",
      facilityLabel: "स्वास्थ्य केंद्र",
      facilityPlaceholder: "स्वास्थ्य केंद्र चुनें…",
      dateLabel: "तारीख",
      timeLabel: "समय स्लॉट",
      nameLabel: "मरीज़ का नाम",
      namePlaceholder: "पूरा नाम",
      phoneLabel: "फ़ोन नंबर",
      phonePlaceholder: "10 अंकों का मोबाइल नंबर",
      bookButton: "अपॉइंटमेंट बुक करें",
      errorFacility: "कृपया स्वास्थ्य केंद्र चुनें।",
      errorDate: "कृपया मान्य तारीख चुनें (आज या अगले 30 दिनों तक)।",
      errorTime: "कृपया समय स्लॉट चुनें।",
      errorName: "कृपया मरीज़ का नाम लिखें।",
      errorPhone: "कृपया 10 अंकों का मान्य मोबाइल नंबर लिखें।",
      nameMin: "नाम कम से कम 3 अक्षरों का होना चाहिए।",
      nameMax: "नाम 100 अक्षरों से अधिक नहीं हो सकता।",
      nameInvalid: "केवल अक्षर, स्थान और बुनियादी विराम चिह्न का उपयोग करें।",
      phoneRequired: "फ़ोन नंबर आवश्यक है।",
      phoneInvalid: "कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।",
      toastError: "हाइलाइट किए गए फ़ील्ड ठीक करके फिर कोशिश करें।",
      confirmationTitle: "अपॉइंटमेंट कन्फ़र्म हुआ",
      confirmationSub: "आपका स्लॉट सफलतापूर्वक बुक हो गया है",
      queueMessage: "आप कतार में #{n} नंबर पर हैं",
      waitTime: "अनुमानित प्रतीक्षा समय",
      waitMinutes: "लगभग {n} मिनट",
      selectedDate: "तारीख",
      selectedTime: "समय",
      bookAnother: "नया अपॉइंटमेंट",
      todayAppointments: "आज के अपॉइंटमेंट",
      todaySub: "स्वास्थ्य केंद्रों पर लाइव कतार",
      colPatient: "मरीज़ का नाम",
      colFacility: "सुविधा",
      colTime: "समय",
      colQueue: "कतार #",
      colStatus: "स्थिति",
      statusWaiting: "प्रतीक्षा में",
      statusCompleted: "पूर्ण",
      filterAll: "सभी",
      newTag: "नया",
      noAppointments: "इस फ़िल्टर से कोई अपॉइंटमेंट मेल नहीं खाता।",
      noAppointmentsToday: "आज कोई अपॉइंटमेंट नहीं। बुक करके शुरुआत करें →",
    },
    doctor: {
      badge: "डॉक्टर पैनल",
      title: "डॉक्टर पैनल",
      description: "मरीज़ों की कतार प्रबंधित करें और डिजिटल प्रिस्क्रिप्शन जारी करें।",
      queueTitle: "मरीज़ कतार",
      queueSub: "पहले आपातकाल, फिर ध्यान देने योग्य और सुरक्षित मामले",
      queueEmpty: "कोई प्रतीक्षारत मरीज़ नहीं — कतार खाली है।",
      waitingWord: "प्रतीक्षा",
      minutesUnit: "मिनट",
      emptyTitle: "मरीज़ चुनें",
      emptySub: "प्रिस्क्रिप्शन शुरू करने के लिए कतार से मरीज़ चुनें।",
      patientDetails: "मरीज़ की जानकारी",
      patientLabel: "मरीज़",
      doctorLabel: "डॉक्टर",
      ageLabel: "आयु",
      ageUnit: "साल",
      symptomsLabel: "लक्षण",
      severityLabel: "गंभीरता",
      formTitle: "नई प्रिस्क्रिप्शन",
      diagnosis: "निदान",
      diagPlaceholder: "जैसे, पानी की कमी के साथ वायरल बुखार",
      medicinesLabel: "दवाइयाँ",
      medName: "दवा का नाम",
      medNamePh: "जैसे, पैरासिटामोल",
      dosage: "खुराक",
      dosagePh: "जैसे, 500mg",
      frequency: "आवृत्ति",
      duration: "अवधि",
      durationPh: "जैसे, 5 दिन",
      addMedicine: "दवा जोड़ें",
      removeMedicine: "हटाएँ",
      notes: "डॉक्टर के नोट्स",
      notesPlaceholder: "आराम करें, खूब पानी पिएँ और लक्षण बिगड़ें तो दोबारा आएँ…",
      urgency: "उच्च स्वास्थ्य सुविधा के लिए रेफ़र करें",
      savePrescription: "प्रिस्क्रिप्शन सेव करें",
      errorDiagnosis: "कृपया निदान लिखें।",
      errorMedicine: "हर दवा के लिए नाम और खुराक आवश्यक है।",
      errorMedicineMin: "कम से कम एक दवा का नाम और खुराक जोड़ें।",
      frequencies: {
        once: "दिन में एक बार",
        twice: "दिन में दो बार",
        thrice: "दिन में तीन बार",
        asNeeded: "आवश्यकतानुसार",
      },
      doctorName: "डॉ. शर्मा",
      cardHeader: "स्वास्थ्य सेतु - Health Bridge",
      qrText: "डिजिटल कॉपी के लिए स्कैन करें",
      print: "प्रिंट करें",
      sendToPatient: "मरीज़ को भेजें",
      sending: "भेजा जा रहा है...",
      sent: "✓ भेजा गया",
      sentToastNamed: "{name} को प्रिस्क्रिप्शन भेज दिया गया",
      sentToast: "प्रिस्क्रिप्शन मरीज़ के फ़ोन पर भेज दिया गया",
      newPrescription: "नई प्रिस्क्रिप्शन",
      markCompleted: "पूर्ण करें",
      completedToast: "अपॉइंटमेंट पूर्ण चिन्हित हुआ",
      orderTests: "लैब टेस्ट ऑर्डर करें",
      orderTestsSub: "इस मरीज़ के लिए टेस्ट चुनें",
      labToast: "{n} लैब टेस्ट ऑर्डर हुए",
      pastVisits: "पिछली यात्राएँ",
      noHistory: "इस मरीज़ की अभी कोई पिछली यात्रा दर्ज नहीं है।",
      scheduleFollowup: "फॉलो-अप शेड्यूल करें",
      followupDate: "फॉलो-अप तिथि",
      referTarget: "कहाँ रेफ़र करें",
      referTargetPh: "लक्ष्य स्वास्थ्य केंद्र चुनें…",
      referError: "रेफ़रल के लिए लक्ष्य स्वास्थ्य केंद्र चुनें।",
      followUpError: "फॉलो-अप तिथि चुनें।",
      followupToast: "{date} के लिए फॉलो-अप शेड्यूल हुआ",
      referralToast: "{facility} के लिए रेफ़रल बनाया गया",
    },
    bedTypes: {
      general: "सामान्य",
      icu: "ICU",
      maternity: "मातृत्व",
    },
    labOrders: {
      badge: "प्रयोगशाला",
      title: "लैब ऑर्डर",
      description:
        "नमूना संग्रह से लेकर परिणाम तक, मरीज़ों के लिए ऑर्डर किए गए लैब टेस्ट पर नज़र रखें।",
      colPatient: "मरीज़",
      colTests: "टेस्ट",
      colFacility: "सुविधा",
      colDate: "तिथि",
      colStatus: "स्थिति",
      statusPending: "लंबित",
      statusCompleted: "पूर्ण",
      colResult: "परिणाम",
      markComplete: "पूर्ण करें",
      completedToast: "लैब टेस्ट पूर्ण चिन्हित हुआ",
      noOrders: "अभी कोई लैब ऑर्डर नहीं है। डॉक्टर पैनल से बनाए गए ऑर्डर यहाँ दिखेंगे।",
      updated: "लैब ऑर्डर स्थिति अपडेट हुई",
    },
    escalation: {
      badge: "आपातकालीन प्रतिक्रिया",
      title: "आपातकालीन एस्कलेशन",
      description: "लाल गंभीरता वाले ट्रायज मामले स्वतः जिला आपातकालीन नेटवर्क में भेजे जाते हैं।",
      colPatient: "मरीज़",
      colSymptoms: "लक्षण",
      colFacility: "कहाँ भेजा गया",
      colTime: "समय",
      colStatus: "स्थिति",
      statusEscalated: "भेजा गया",
      statusResolved: "हल हुआ",
      noEscalations: "अभी कोई आपातकालीन मामला नहीं। लाल गंभीरता वाले ट्रायज परिणाम यहाँ स्वतः दिखेंगे।",
      notifiedBanner: "आपातकालीन संपर्क को सूचित किया गया",
      notFound: "कोई एस्कलेटेड मामला नहीं मिला।",
      updated: "एस्कलेशन स्थिति अपडेट हुई",
    },
    myRecords: {
      badge: "व्यक्तिगत स्वास्थ्य",
      title: "मेरे रिकॉर्ड",
      description: "अपना मोबाइल नंबर डालें और अपनी यात्राएँ, प्रिस्क्रिप्शन, लैब रिपोर्ट और फॉलो-अप देखें।",
      phoneLabel: "मोबाइल नंबर",
      phonePlaceholder: "10 अंकों का मोबाइल नंबर",
      findRecords: "मेरे रिकॉर्ड खोजें",
      notFound: "इस नंबर के लिए कोई रिकॉर्ड नहीं मिला। अपॉइंटमेंट बुक करें या स्वास्थ्य केंद्र जाएँ।",
      visitsSection: "पिछली यात्राएँ और प्रिस्क्रिप्शन",
      noVisits: "अभी कोई पिछली यात्रा नहीं।",
      followupsSection: "आगामी फॉलो-अप",
      noFollowups: "कोई आगामी फॉलो-अप नहीं।",
      labsSection: "लैब टेस्ट",
      noLabs: "कोई लैब टेस्ट ऑर्डर नहीं हुआ।",
      appointmentsSection: "अपॉइंटमेंट",
      noAppointments: "कोई अपॉइंटमेंट बुक नहीं हुआ।",
      emergenciesSection: "आपातकालीन एस्कलेशन",
      noEmergencies: "कोई आपातकालीन मामला नहीं।",
      labStatusPending: "लंबित",
      labStatusCompleted: "पूर्ण",
      referralsSection: "सक्रिय रेफ़रल",
      noReferrals: "कोई सक्रिय रेफ़रल नहीं।",
      note: "डेमो सुझाव: 9876543210 आज़माएँ (Nischitha का नंबर)।",
    },
    asha: {
      badge: "सामुदायिक स्वास्थ्य",
      title: "आशा कार्यकर्ता डैशबोर्ड",
      description:
        "गाँव के मरीज़ों को पंजीकृत करें, त्वरित जाँच करें और डॉक्टर के पास रेफ़र करें।",
      registerTitle: "नया मरीज़ पंजीकृत करें",
      registerSub: "अपनी सूची में जोड़ने के लिए मरीज़ का विवरण भरें",
      nameLabel: "मरीज़ का नाम",
      namePh: "पूरा नाम",
      phoneLabel: "फ़ोन नंबर",
      phonePh: "10 अंकों का मोबाइल नंबर",
      ageLabel: "आयु",
      agePh: "आयु (सालों में)",
      genderLabel: "लिंग",
      genderMale: "पुरुष",
      genderFemale: "महिला",
      genderOther: "अन्य",
      villageLabel: "गाँव",
      villagePh: "जैसे, शेलगाँव",
      symptomsLabel: "लक्षण",
      symptomsPh: "जैसे, 2 दिन से बुखार और सिरदर्द",
      facilityLabel: "नियुक्त स्वास्थ्य केंद्र",
      facilityPh: "स्वास्थ्य केंद्र चुनें…",
      registerButton: "मरीज़ पंजीकृत करें",
      registeredToast: "मरीज़ सफलतापूर्वक पंजीकृत हुआ",
      myPatients: "मेरे मरीज़",
      myPatientsSub: "आपके समुदाय में पंजीकृत मरीज़",
      noPatients:
        "अभी कोई मरीज़ पंजीकृत नहीं है। अपना पहला मरीज़ जोड़ने के लिए ऊपर दिया फ़ॉर्म भरें।",
      quickTriage: "त्वरित जाँच",
      referDoctor: "डॉक्टर को रेफ़र करें",
      referredChip: "रेफ़र किया गया",
      referredToast: "अपॉइंटमेंट बनाया गया — कतार #{n}",
      noSymptomsHint: "जाँच और रेफ़रल के लिए लक्षण जोड़ें",
      severityLabel: "गंभीरता",
    },
    followup: {
      badge: "फॉलो-अप देखभाल",
      title: "फॉलो-अप कार्यक्रम",
      description:
        "नेटवर्क में फॉलो-अप यात्राओं के लिए नियत उच्च-जोखिम मरीज़।",
      colPatient: "मरीज़",
      colDiagnosis: "निदान",
      colDate: "फॉलो-अप तिथि",
      colFacility: "सुविधा",
      colStatus: "स्थिति",
      statusOverdue: "समय बीत चुका",
      statusToday: "आज नियत",
      statusUpcoming: "आगामी",
      noFollowups: "अभी कोई फॉलो-अप शेड्यूल नहीं है। डॉक्टर पैनल से शेड्यूल करें।",
    },
    common: {
      completedStatus: "पूर्ण",
      completedToday: "आज पूर्ण",
      noCompletedYet: "अभी आज कोई मरीज़ पूर्ण नहीं हुआ।",
    },
    referrals: {
      badge: "रेफ़रल ट्रैकिंग",
      title: "रेफ़रल",
      description: "उच्च स्वास्थ्य सुविधाओं के लिए रेफ़र किए गए मरीज़ों पर नज़र रखें।",
      colPatient: "मरीज़",
      colFrom: "से",
      colTo: "तक",
      colDate: "तिथि",
      colReason: "कारण",
      colStatus: "स्थिति",
      statusPending: "लंबित",
      statusInTransit: "पारगमन में",
      statusCompleted: "पूर्ण",
      noReferrals: "अभी कोई रेफ़रल नहीं है। डॉक्टर पैनल से बनाए गए रेफ़रल यहाँ दिखेंगे।",
      updated: "रेफ़रल स्थिति अपडेट हुई",
    },
  },
};

export function getTranslations(lang: Language): Translation {
  return translations[lang] ?? translations.en;
}