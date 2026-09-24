"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "EN" | "HI" | "MR";

export interface Translations {
  // Navigation
  navOverview: string;
  navMap: string;
  navMatrix: string;
  navAlerts: string;
  navCommunity: string;
  navCommand: string;
  navAssistant: string;
  navAbout: string;
  demoBadge: string;
  liveBadge: string;

  // Overview
  greeting: string;
  regionPune: string;
  updatedSecAgo: string;
  aiAlertBanner: string;
  viewDetails: string;
  currentRegionalRisk: string;
  riskTrend: string;
  dangerThreshold: string;
  rainfall: string;
  humidity: string;
  incidents: string;
  trend: string;
  criticalZones: string;
  highRiskZones: string;
  activeReports: string;
  emergencyShelters: string;
  hyperlocalSnapshot: string;
  openFullMap: string;
  timeRangeToday: string;
  timeRange7Days: string;
  timeRange30Days: string;

  // Alerts
  liveAlerts: string;
  allClearTitle: string;
  allClearDesc: string;
  floodRisk: string;
  viewArea: string;
  safetyActions: string;
  whatShouldYouDo: string;
  filterAll: string;
  filterCritical: string;
  filterHigh: string;
  filterModerate: string;

  // Community
  communityIntel: string;
  communitySubtitle: string;
  reportIncident: string;
  reportModalTitle: string;
  incidentType: string;
  areaLocality: string;
  description: string;
  severityLevel: string;
  uploadPhoto: string;
  submitReport: string;
  reportReceived: string;
  thankYouMessage: string;
  closeBtn: string;

  // Command Center
  commandCenterTitle: string;
  commandCenterSub: string;
  criticalAreas: string;
  responseTeams: string;
  shelters: string;
  hospitals: string;
  priorityAreas: string;
  resourceAllocation: string;
  dispatchBtn: string;
  mobilizingBtn: string;
  onSceneBtn: string;

  // Assistant
  assistantTitle: string;
  assistantSubtitle: string;
  askQuestionPlaceholder: string;
  quickFlood: string;
  quickHeatwave: string;
  quickLandslide: string;
  quickFire: string;
  quickMedical: string;

  // Profile
  profileTitle: string;
  profileSubtitle: string;
  roleDesignation: string;
  preferredRegion: string;
  emergencyContact: string;
  savePreferences: string;
  preferencesSaved: string;
  smsAlerts: string;
  emailAlerts: string;
  pushAlerts: string;
  alertThreshold: string;
  languageLabel: string;
  signOut: string;

  // Map Page
  mapTitle: string;
  mapSub: string;
  map2dToggle: string;
  map3dToggle: string;
  layerRainfall: string;
  layerCorridors: string;
  layerVulnerability: string;
  layerReports: string;
  layerHeatmap: string;
  facilitiesLabel: string;
  forecastHorizon: string;
  sectorDetails: string;
  runoffRisk: string;
  elevation: string;
  nearestShelter: string;
  nearestHospital: string;
  emergencyHotline: string;
  searchSectors: string;

  // Matrix Page
  matrixTitle: string;
  matrixSub: string;
  matrixTabMatrix: string;
  matrixTabSummary: string;
  matrixSearchPlaceholder: string;
  matrixAiAssessment: string;
  matrixThresholdsLegend: string;
  matrixExport: string;
  catAll: string;
  catHydrological: string;
  catInfrastructure: string;
  catGeological: string;
  catHealth: string;
  catLogistical: string;

  // Additional Alerts & Safety
  alertDescTemplate: string;
  safetyProtocolTitle: string;
  highHazardWarning: string;
  flashPoolingWarning: string;
  nearestSafeCamp: string;
  designatedTraumaCenter: string;

  // Command Center Actions
  teamMedical: string;
  teamRescue: string;
  teamShelter: string;
  teamTraffic: string;
  statusStandby: string;
  statusMobilizing: string;
  statusDispatched: string;
  statusOnScene: string;

  // Assistant
  assistantGreeting: string;

  // About Page
  aboutTitle: string;
  aboutSubtitle: string;
  teamHeader: string;
  teamSubtitle: string;
  roadmapHeader: string;
  roadmapSubtitle: string;
  contactHeader: string;
  contactSubtitle: string;
  formName: string;
  formEmail: string;
  formTopic: string;
  formMessage: string;
  formSubmit: string;
  formTransmitting: string;
  formSuccessTitle: string;
  formSuccessDesc: string;
  formSendAnother: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  EN: {
    navOverview: "Overview",
    navMap: "Risk map",
    navMatrix: "Risk matrix",
    navAlerts: "Alerts",
    navCommunity: "Community",
    navCommand: "Command center",
    navAssistant: "Assistant",
    navAbout: "About",
    demoBadge: "DEMO",
    liveBadge: "LIVE",

    greeting: "Good morning. Here's your community risk overview.",
    regionPune: "Pune region",
    updatedSecAgo: "Updated {sec} seconds ago",
    aiAlertBanner: "AI Alert: Rainfall trend suggests Wakad may cross critical threshold in ~6 hours.",
    viewDetails: "View details",
    currentRegionalRisk: "Current regional risk",
    riskTrend: "Risk trend",
    dangerThreshold: "Danger threshold",
    rainfall: "Rainfall",
    humidity: "Humidity",
    incidents: "Incidents",
    trend: "Trend",
    criticalZones: "Critical zones",
    highRiskZones: "High risk zones",
    activeReports: "Active reports",
    emergencyShelters: "Emergency shelters",
    hyperlocalSnapshot: "Hyperlocal snapshot",
    openFullMap: "Open full map",
    timeRangeToday: "Today",
    timeRange7Days: "7 Days",
    timeRange30Days: "30 Days",

    liveAlerts: "Live alerts",
    allClearTitle: "You're all clear",
    allClearDesc: "No critical alerts in your selected region.",
    floodRisk: "flood risk",
    viewArea: "View area",
    safetyActions: "Safety actions",
    whatShouldYouDo: "What should you do?",
    filterAll: "All",
    filterCritical: "Critical",
    filterHigh: "High",
    filterModerate: "Moderate",

    communityIntel: "Community intelligence",
    communitySubtitle: "Live crowdsourced hazard reports across Maharashtra",
    reportIncident: "Report incident",
    reportModalTitle: "Report an incident",
    incidentType: "Incident type",
    areaLocality: "Area / Locality",
    description: "Description",
    severityLevel: "Estimated Severity",
    uploadPhoto: "Upload photo from scene (Max 5MB)",
    submitReport: "Submit report",
    reportReceived: "Report received",
    thankYouMessage: "Thank you for helping your community stay resilient.",
    closeBtn: "Close",

    commandCenterTitle: "Emergency command center",
    commandCenterSub: "Real-time tactical mobilization & resource staging",
    criticalAreas: "Critical areas",
    responseTeams: "Response teams",
    shelters: "Shelters",
    hospitals: "Hospitals",
    priorityAreas: "Priority areas",
    resourceAllocation: "Recommended resource allocation",
    dispatchBtn: "Dispatch",
    mobilizingBtn: "Mobilizing...",
    onSceneBtn: "On Scene",

    assistantTitle: "ResiliAI assistant",
    assistantSubtitle: "Get clear, location-aware emergency guidance.",
    askQuestionPlaceholder: "Ask a safety question…",
    quickFlood: "Flood",
    quickHeatwave: "Heatwave",
    quickLandslide: "Landslide",
    quickFire: "Fire",
    quickMedical: "Medical emergency",

    profileTitle: "Your profile",
    profileSubtitle: "Personalize alerts and response context for your account.",
    roleDesignation: "Role / designation",
    preferredRegion: "Preferred region",
    emergencyContact: "Emergency contact",
    savePreferences: "Save preferences",
    preferencesSaved: "Preferences saved",
    smsAlerts: "SMS alerts",
    emailAlerts: "Email alerts",
    pushAlerts: "Push alerts",
    alertThreshold: "Alert threshold",
    languageLabel: "Language",
    signOut: "Sign out",

    // Map Page
    mapTitle: "Live Risk Map",
    mapSub: "Tactical 2D & 3D Topographic Simulation",
    map2dToggle: "2D Flood Grid",
    map3dToggle: "3D Vector Terrain",
    layerRainfall: "Rainfall",
    layerCorridors: "Corridors",
    layerVulnerability: "Vulnerability",
    layerReports: "Citizen Reports",
    layerHeatmap: "Heatmap",
    facilitiesLabel: "Facilities",
    forecastHorizon: "Forecast Horizon",
    sectorDetails: "Sector details",
    runoffRisk: "Runoff Risk",
    elevation: "Elevation",
    nearestShelter: "Nearest Shelter",
    nearestHospital: "Nearest Hospital",
    emergencyHotline: "Emergency Hotline",
    searchSectors: "Search sector or ward...",

    // Matrix Page
    matrixTitle: "Enterprise Disaster Risk Matrix",
    matrixSub: "Multi-hazard probability vs impact matrix",
    matrixTabMatrix: "Matrix View",
    matrixTabSummary: "Executive Summary",
    matrixSearchPlaceholder: "Search risk, category, owner...",
    matrixAiAssessment: "Recalculate AI Risks",
    matrixThresholdsLegend: "Thresholds & Legend",
    matrixExport: "Export Audit Report",
    catAll: "All",
    catHydrological: "Hydrological",
    catInfrastructure: "Infrastructure",
    catGeological: "Geological",
    catHealth: "Health",
    catLogistical: "Logistical",

    // Additional Alerts & Safety
    alertDescTemplate: "Estimated flood risk has increased to {risk}% due to heavy rainfall ({rainfall} mm) and local topography.",
    safetyProtocolTitle: "Immediate Safety Protocol",
    highHazardWarning: "High Hazard Inundation Warning",
    flashPoolingWarning: "Flash pooling active along arterial corridors. Water levels are rising rapidly.",
    nearestSafeCamp: "Nearest Safe Shelter",
    designatedTraumaCenter: "Designated Trauma Center",

    // Command Center Actions
    teamMedical: "Medical team",
    teamRescue: "Rescue team",
    teamShelter: "Shelter activation",
    teamTraffic: "Traffic control",
    statusStandby: "Standby",
    statusMobilizing: "Mobilizing...",
    statusDispatched: "Dispatched",
    statusOnScene: "On Scene",

    // Assistant
    assistantGreeting: "Hi, I'm your ResiliAI assistant. Ask me anything about staying safe, or choose a quick action below.",

    // About Page
    aboutTitle: "About ResiliAI",
    aboutSubtitle: "We are the Avengers engineering cohort behind ResiliAI — building enterprise-grade, real-time hydrological risk intelligence and automated municipal disaster defense systems.",
    teamHeader: "Avengers Team Members",
    teamSubtitle: "Core contributors building ResiliAI.",
    roadmapHeader: "System Architecture & Roadmap",
    roadmapSubtitle: "Interactive milestone tracking for engineering deployments.",
    contactHeader: "Contact & Technical Inquiries",
    contactSubtitle: "Submit feedback, vulnerability alerts, or municipal collaboration requests.",
    formName: "Full Name",
    formEmail: "Email Address",
    formTopic: "Inquiry Topic",
    formMessage: "Message Details",
    formSubmit: "Submit Inquiry",
    formTransmitting: "Transmitting...",
    formSuccessTitle: "Inquiry Transmitted Successfully",
    formSuccessDesc: "Thank you for contacting the Avengers engineering core. Our operational dispatch team has received your message and will review it shortly.",
    formSendAnother: "Send Another Inquiry",
  },

  HI: {
    navOverview: "अवलोकन",
    navMap: "जोखिम मानचित्र",
    navMatrix: "जोखिम मैट्रिक्स",
    navAlerts: "चेतावनियाँ",
    navCommunity: "समुदाय",
    navCommand: "कमांड सेंटर",
    navAssistant: "सहायक",
    navAbout: "परिचय",
    demoBadge: "डेमो",
    liveBadge: "सक्रिय",

    greeting: "शुभ प्रभात। यहाँ आपके समुदाय का जोखिम अवलोकन है।",
    regionPune: "पुणे क्षेत्र",
    updatedSecAgo: "{sec} सेकंड पहले अपडेट हुआ",
    aiAlertBanner: "AI चेतावनी: वर्षा का रुझान बताता है कि वाकड़ ~6 घंटों में गंभीर सीमा पार कर सकता है।",
    viewDetails: "विवरण देखें",
    currentRegionalRisk: "वर्तमान क्षेत्रीय जोखिम",
    riskTrend: "जोखिम का रुझान",
    dangerThreshold: "खतरे की सीमा",
    rainfall: "वर्षा",
    humidity: "आर्द्रता",
    incidents: "घटनाएँ",
    trend: "रुझान",
    criticalZones: "गंभीर क्षेत्र",
    highRiskZones: "उच्च जोखिम क्षेत्र",
    activeReports: "सक्रिय रिपोर्ट",
    emergencyShelters: "आपातकालीन आश्रय",
    hyperlocalSnapshot: "हाइपरलोकल सारांश",
    openFullMap: "पूर्ण मानचित्र खोलें",
    timeRangeToday: "आज",
    timeRange7Days: "7 दिन",
    timeRange30Days: "30 दिन",

    liveAlerts: "सक्रिय चेतावनियाँ",
    allClearTitle: "सब सुरक्षित है",
    allClearDesc: "आपके चयनित क्षेत्र में कोई गंभीर चेतावनी नहीं है।",
    floodRisk: "बाढ़ का जोखिम",
    viewArea: "क्षेत्र देखें",
    safetyActions: "सुरक्षा कदम",
    whatShouldYouDo: "आपको क्या करना चाहिए?",
    filterAll: "सभी",
    filterCritical: "गंभीर",
    filterHigh: "उच्च",
    filterModerate: "मध्यम",

    communityIntel: "सामुदायिक सतर्कता",
    communitySubtitle: "महाराष्ट्र भर से लाइव क्राउडसोर्स्ड आपदा रिपोर्ट",
    reportIncident: "घटना दर्ज करें",
    reportModalTitle: "घटना की सूचना दें",
    incidentType: "घटना का प्रकार",
    areaLocality: "क्षेत्र / इलाका",
    description: "विवरण",
    severityLevel: "अनुमानित गंभीरता",
    uploadPhoto: "घटनास्थल की तस्वीर अपलोड करें (अधिकतम 5MB)",
    submitReport: "रिपोर्ट सबमिट करें",
    reportReceived: "रिपोर्ट प्राप्त हुई",
    thankYouMessage: "समुदाय को सुरक्षित रखने में मदद के लिए धन्यवाद।",
    closeBtn: "बंद करें",

    commandCenterTitle: "आपातकालीन नियंत्रण कक्ष",
    commandCenterSub: "वास्तविक समय सामरिक लामबंदी और संसाधन तैयारी",
    criticalAreas: "गंभीर क्षेत्र",
    responseTeams: "प्रतिक्रिया दल",
    shelters: "राहत आश्रय",
    hospitals: "अस्पताल",
    priorityAreas: "प्राथमिकता क्षेत्र",
    resourceAllocation: "अनुशंसित संसाधन आवंटन",
    dispatchBtn: "भेजें",
    mobilizingBtn: "रवाना हो रहे हैं...",
    onSceneBtn: "घटनास्थल पर",

    assistantTitle: "रेज़िलीएआई सहायक",
    assistantSubtitle: "स्थान-जागरूक आपातकालीन सुरक्षा मार्गदर्शन प्राप्त करें।",
    askQuestionPlaceholder: "सुरक्षा संबंधी प्रश्न पूछें…",
    quickFlood: "बाढ़",
    quickHeatwave: "लू / भीषण गर्मी",
    quickLandslide: "भूस्खलन",
    quickFire: "आग",
    quickMedical: "चिकित्सा आपातकाल",

    profileTitle: "आपकी प्रोफ़ाइल",
    profileSubtitle: "अपने खाते के लिए अलर्ट और प्रतिक्रिया संदर्भ अनुकूलित करें।",
    roleDesignation: "पद / भूमिका",
    preferredRegion: "पसंदीदा क्षेत्र",
    emergencyContact: "आपातकालीन संपर्क",
    savePreferences: "प्राथमिकताएं सहेजें",
    preferencesSaved: "सफलतापूर्वक सहेजा गया",
    smsAlerts: "एसएमएस अलर्ट",
    emailAlerts: "ईमेल अलर्ट",
    pushAlerts: "पुश सूचनाएं",
    alertThreshold: "अलर्ट सीमा",
    languageLabel: "भाषा",
    signOut: "साइन आउट",

    // Map Page
    mapTitle: "सक्रिय जोखिम मानचित्र",
    mapSub: "रणनीतिक 2D और 3D स्थलाकृतिक बाढ़ सिमुलेशन",
    map2dToggle: "2D सामरिक ग्रिड",
    map3dToggle: "3D वेक्टर इलाके",
    layerRainfall: "वर्षा",
    layerCorridors: "गलियारे",
    layerVulnerability: "संवेदनशीलता",
    layerReports: "नागरिक रिपोर्ट",
    layerHeatmap: "हीटमैप",
    facilitiesLabel: "राहत सुविधाएं",
    forecastHorizon: "पूर्वानुमान समय",
    sectorDetails: "क्षेत्रीय विवरण",
    runoffRisk: "जलभराव जोखिम",
    elevation: "ऊंचाई",
    nearestShelter: "निकटतम आश्रय",
    nearestHospital: "निकटतम अस्पताल",
    emergencyHotline: "आपातकालीन हेल्पलाइन",
    searchSectors: "क्षेत्र या वार्ड खोजें...",

    // Matrix Page
    matrixTitle: "एंटरप्राइज आपदा जोखिम मैट्रिक्स",
    matrixSub: "बहु-आपदा संभावना बनाम प्रभाव विश्लेषण",
    matrixTabMatrix: "मैट्रिक्स दृश्य",
    matrixTabSummary: "कार्यकारी सारांश",
    matrixSearchPlaceholder: "जोखिम, क्षेत्र या स्वामी खोजें...",
    matrixAiAssessment: "AI जोखिम पुनर्गणना",
    matrixThresholdsLegend: "सीमाएं और संकेत",
    matrixExport: "ऑडिट रिपोर्ट डाउनलोड",
    catAll: "सभी",
    catHydrological: "जल विज्ञान",
    catInfrastructure: "बुनियादी ढांचा",
    catGeological: "भूगर्भीय",
    catHealth: "स्वास्थ्य",
    catLogistical: "रसद व परिवहन",

    // Additional Alerts & Safety
    alertDescTemplate: "भारी वर्षा ({rainfall} मिमी) और स्थानीय स्थलाकृति के कारण अनुमानित बाढ़ जोखिम बढ़कर {risk}% हो गया है।",
    safetyProtocolTitle: "तत्काल सुरक्षा निर्देश",
    highHazardWarning: "उच्च जोखिम बाढ़ चेतावनी",
    flashPoolingWarning: "मुख्य मार्गों पर जलभराव सक्रिय है। जल स्तर तेजी से बढ़ रहा है।",
    nearestSafeCamp: "निकटतम सुरक्षित राहत शिविर",
    designatedTraumaCenter: "नामित ट्रॉमा सेंटर",

    // Command Center Actions
    teamMedical: "चिकित्सा दल",
    teamRescue: "बचाव दल",
    teamShelter: "आश्रय सक्रियण",
    teamTraffic: "यातायात नियंत्रण",
    statusStandby: "तैयार",
    statusMobilizing: "रवाना हो रहे हैं...",
    statusDispatched: "तैनात",
    statusOnScene: "घटनास्थल पर",

    // Assistant
    assistantGreeting: "नमस्ते! मैं आपका रेज़िलीएआई सहायक हूँ। सुरक्षा उपायों के बारे में मुझसे कुछ भी पूछें, या नीचे दिए गए विकल्पों में से चुनें।",

    // About Page
    aboutTitle: "रेज़िलीएआई के बारे में",
    aboutSubtitle: "हम रेज़िलीएआई का निर्माण करने वाली अवेंजर्स इंजीनियरिंग टीम हैं — वास्तविक समय जल जोखिम बुद्धिमत्ता और स्वचालित आपदा प्रबंधन प्रणाली।",
    teamHeader: "अवेंजर्स टीम के सदस्य",
    teamSubtitle: "रेज़िलीएआई का निर्माण करने वाले मुख्य योगदानकर्ता।",
    roadmapHeader: "प्रणाली वास्तुकला एवं रोडमैप",
    roadmapSubtitle: "इंजीनियरिंग तैनाती के लिए मील के पत्थर।",
    contactHeader: "संपर्क एवं तकनीकी पूछताछ",
    contactSubtitle: "प्रतिक्रिया, भेद्यता रिपोर्ट या नगर निगम सहयोग के लिए संपर्क करें।",
    formName: "पूरा नाम",
    formEmail: "ईमेल पता",
    formTopic: "पूछताछ का विषय",
    formMessage: "संदेश विवरण",
    formSubmit: "पूछताछ सबमिट करें",
    formTransmitting: "भेज रहे हैं...",
    formSuccessTitle: "पूछताछ सफलतापूर्वक भेजी गई",
    formSuccessDesc: "अवेंजर्स टीम से संपर्क करने के लिए धन्यवाद। हमारा परिचालन दल जल्द ही इसकी समीक्षा करेगा।",
    formSendAnother: "एक और संदेश भेजें",
  },

  MR: {
    navOverview: "विहंगावलोकन",
    navMap: "धोका नकाशा",
    navMatrix: "धोका मॅट्रिक्स",
    navAlerts: "सूचना",
    navCommunity: "समुदाय",
    navCommand: "नियंत्रण कक्ष",
    navAssistant: "मदतनीस",
    navAbout: "माहिती",
    demoBadge: "डेमो",
    liveBadge: "थेट",

    greeting: "शुभ प्रभात. हे तुमच्या परिसराचे आपत्ती धोका विहंगावलोकन आहे.",
    regionPune: "पुणे परिसर",
    updatedSecAgo: "{sec} सेकंदांपूर्वी अद्यतनित",
    aiAlertBanner: "AI सूचना: पावसाच्या नोंदीनुसार वाकड भागात ~6 तासांत धोका पातळी ओलांडू शकते.",
    viewDetails: "तपशील पहा",
    currentRegionalRisk: "सध्याचा प्रादेशिक धोका",
    riskTrend: "धोक्याचा कल",
    dangerThreshold: "धोका पातळी",
    rainfall: "पाऊस",
    humidity: "दमटपणा",
    incidents: "घटना",
    trend: "कल",
    criticalZones: "अतिसंवेदनशील क्षेत्र",
    highRiskZones: "उच्च धोका क्षेत्र",
    activeReports: "सक्रिय अहवाल",
    emergencyShelters: "आपत्कालीन निवारा",
    hyperlocalSnapshot: "स्थानिक आढावा",
    openFullMap: "पूर्ण नकाशा उघडा",
    timeRangeToday: "आज",
    timeRange7Days: "७ दिवस",
    timeRange30Days: "३० दिवस",

    liveAlerts: "थेट सूचना व इशारे",
    allClearTitle: "सर्व सुरक्षित आहे",
    allClearDesc: "तुमच्या निवडलेल्या परिसरात कोणतीही गंभीर चेतावणी नाही.",
    floodRisk: "पूर धोका",
    viewArea: "परिसर पहा",
    safetyActions: "सुरक्षा उपाय",
    whatShouldYouDo: "तुम्ही काय करावे?",
    filterAll: "सर्व",
    filterCritical: "गंभीर",
    filterHigh: "उच्च",
    filterModerate: "मध्यम",

    communityIntel: "सामुदायिक माहिती",
    communitySubtitle: "संपूर्ण महाराष्ट्रातील थेट नागरिकांचे संकट अहवाल",
    reportIncident: "घटना नोंदवा",
    reportModalTitle: "आपत्ती घटनेची नोंद करा",
    incidentType: "घटनेचा प्रकार",
    areaLocality: "परिसर / पत्ता",
    description: "तपशील",
    severityLevel: "अंदाजे तीव्रता",
    uploadPhoto: "घटनास्थळाचे छायाचित्र (कमाल 5MB)",
    submitReport: "अहवाल पाठवा",
    reportReceived: "नोंद स्वीकारली",
    thankYouMessage: "समुदाय सुरक्षित ठेवण्यासाठी सहकार्याबद्दल धन्यवाद.",
    closeBtn: "बंद करा",

    commandCenterTitle: "आपत्कालीन नियंत्रण कक्ष",
    commandCenterSub: "थेट बचाव पथके व संसाधन नियोजन",
    criticalAreas: "गंभीर क्षेत्र",
    responseTeams: "बचाव पथके",
    shelters: "निवारे",
    hospitals: "रुग्णालये",
    priorityAreas: "प्राधान्य क्षेत्र",
    resourceAllocation: "संसाधन वाटप शिफारस",
    dispatchBtn: "रवाना करा",
    mobilizingBtn: "रवाना होत आहे...",
    onSceneBtn: "घटनास्थळी हजर",

    assistantTitle: "रेझिलीएआय मदतनीस",
    assistantSubtitle: "स्थाननिहाय आपत्कालीन मार्गदर्शन व मदत मिळवा.",
    askQuestionPlaceholder: "सुरक्षा प्रश्न विचारा…",
    quickFlood: "पूर",
    quickHeatwave: "उष्णतेची लाट",
    quickLandslide: "दरड कोसळणे",
    quickFire: "आग",
    quickMedical: "वैद्यकीय मदत",

    profileTitle: "तुमची प्रोफाइल",
    profileSubtitle: "सूचना व प्रतिसाद संदर्भ सानुकूल करा.",
    roleDesignation: "पद / भूमिका",
    preferredRegion: "प्राधान्य परिसर",
    emergencyContact: "आपत्कालीन संपर्क",
    savePreferences: "पसंती जतन करा",
    preferencesSaved: "माहिती जतन केली",
    smsAlerts: "SMS सूचना",
    emailAlerts: "ईमेल सूचना",
    pushAlerts: "पुश सूचना",
    alertThreshold: "सूचना मर्यादा",
    languageLabel: "भाषा",
    signOut: "बाहेर पडा",

    // Map Page
    mapTitle: "थेट धोका नकाशा",
    mapSub: "सामरिक 2D आणि 3D भौगोलिक पूर सिमुलेशन",
    map2dToggle: "2D नकाशा",
    map3dToggle: "3D भूप्रदेश",
    layerRainfall: "पाऊस",
    layerCorridors: "मार्ग",
    layerVulnerability: "संवेदनशीलता",
    layerReports: "नागरिक नोंदी",
    layerHeatmap: "उष्णता नकाशा",
    facilitiesLabel: "मदत केंद्रे",
    forecastHorizon: "अंदाज कालावधी",
    sectorDetails: "परिसर तपशील",
    runoffRisk: "पाणी साचण्याचा धोका",
    elevation: "उंची",
    nearestShelter: "जवळचा निवारा",
    nearestHospital: "जवळचे रुग्णालय",
    emergencyHotline: "आपत्कालीन मदत क्रमांक",
    searchSectors: "परिसर किंवा प्रभाग शोधा...",

    // Matrix Page
    matrixTitle: "आपत्ती धोका मॅट्रिक्स",
    matrixSub: "बहु-आपत्ती संभाव्यता व परिणाम विश्लेषण",
    matrixTabMatrix: "मॅट्रिक्स दृश्य",
    matrixTabSummary: "कार्यकारी आढावा",
    matrixSearchPlaceholder: "धोका, परिसर किंवा प्रमुख शोधा...",
    matrixAiAssessment: "AI धोका पुनर्मूल्यांकन",
    matrixThresholdsLegend: "मर्यादा आणि चिन्हे",
    matrixExport: "ऑडिट अहवाल डाउनलोड",
    catAll: "सर्व",
    catHydrological: "जलविज्ञान",
    catInfrastructure: "पायाभूत सुविधा",
    catGeological: "भूगर्भीय",
    catHealth: "आरोग्य",
    catLogistical: "वाहतूक व पुरवठा",

    // Additional Alerts & Safety
    alertDescTemplate: "मुसळधार पाऊस ({rainfall} मिमी) आणि स्थानिक रचनेमुळे अंदाजे पूर धोका {risk}% पर्यंत वाढला आहे.",
    safetyProtocolTitle: "तातडीचे सुरक्षा नियम",
    highHazardWarning: "अतिधोका पूर इशारा",
    flashPoolingWarning: "मुख्य रस्त्यांवर पाणी साचले आहे. पाण्याची पातळी वेगाने वाढत आहे.",
    nearestSafeCamp: "जवळचे सुरक्षित मदत केंद्र",
    designatedTraumaCenter: "नियुक्त ट्रॉमा सेंटर",

    // Command Center Actions
    teamMedical: "वैद्यकीय पथक",
    teamRescue: "बचाव पथक",
    teamShelter: "निवारा सुरू करणे",
    teamTraffic: "वाहतूक नियंत्रण",
    statusStandby: "सज्ज",
    statusMobilizing: "रवाना होत आहे...",
    statusDispatched: "तैनात",
    statusOnScene: "घटनास्थळी हजर",

    // Assistant
    assistantGreeting: "नमस्कार! मी तुमचा रेझिलीएआय मदतनीस आहे. सुरक्षिततेविषयी काहीही विचारा किंवा खालील पर्याय निवडा.",

    // About Page
    aboutTitle: "रेझिलीएआय विषयी",
    aboutSubtitle: "आम्ही रेझिलीएआय निर्माण करणारी अव्हेंजर्स इंजिनिअरिंग टीम आहोत — थेट जल धोका विश्लेषण आणि स्वयंचलित आपत्ती संरक्षण प्रणाली.",
    teamHeader: "अव्हेंजर्स टीम सदस्य",
    teamSubtitle: "रेझिलीएआय विकसित करणारे मुख्य सदस्य.",
    roadmapHeader: "प्रणाली रचना आणि टप्पे",
    roadmapSubtitle: "इंजिनिअरिंग अंमलबजावणीचे महत्त्वाचे टप्पे.",
    contactHeader: "संपर्क आणि तांत्रिक विचारणा",
    contactSubtitle: "सूचना, त्रुटी अहवाल किंवा पालिका सहकार्यासाठी संदेश पाठवा.",
    formName: "पूर्ण नाव",
    formEmail: "ईमेल पत्ता",
    formTopic: "विषय",
    formMessage: "संदेश तपशील",
    formSubmit: "चौकशी पाठवा",
    formTransmitting: "पाठवत आहे...",
    formSuccessTitle: "चौकशी यशस्वीरीत्या पाठवली गेली",
    formSuccessDesc: "अव्हेंजर्स टीमशी संपर्क साधल्याबद्दल धन्यवाद. आमची आपत्कालीन टीम लवकरच पुनरावलोकन करेल.",
    formSendAnother: "दुसरा संदेश पाठवा",
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "EN",
  setLang: () => {},
  t: (key) => TRANSLATIONS.EN[key] || String(key),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("resiliai-language");
      if (saved === "Hindi" || saved === "HI") return "HI";
      if (saved === "Marathi" || saved === "MR") return "MR";
    }
    return "EN";
  });

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
    if (typeof window !== "undefined") {
      const fullLabel = nextLang === "HI" ? "Hindi" : nextLang === "MR" ? "Marathi" : "English";
      localStorage.setItem("resiliai-language", fullLabel);
      localStorage.setItem("resiliai-lang-code", nextLang);
    }
  };

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    let text = TRANSLATIONS[lang]?.[key] || TRANSLATIONS.EN[key] || String(key);
    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
