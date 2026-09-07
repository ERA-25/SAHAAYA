const API_BASE_URL = "http://172.18.227.245:8000";


/* 
   STATE
 */

let selectedCategory = "";
let selectedEmergency = "";
let customEmergencyDescription = "";

let emergencyId = null;
let currentHelper = null;
let matchedHelpers = [];

/* Responder-side state */
let responderEmergencies = [];
let currentResponderEmergency = null;

/* 
   CURRENT BACKEND MATCHING RADII
 */

/

const BACKEND_SEARCH_RADII = [
    150,
    300,
    500,
    1000
];

let currentRadius = 150;


/* 
   RESPONSE PLANS
 */

const RESPONSE_PLANS = {

    Medical: {
        mode: "Nearby responder",
        authority: "EMS / Emergency Services if critical",
        note:
            "SAHAAYA searches for nearby verified responders with the required skill."
    },

    Fire: {
        mode: "Nearby fire responder",
        authority: "Fire & Rescue Services",
        note:
            "SAHAAYA searches for verified fire responders nearby. Official fire services may also be required."
    },

    Accident: {
        mode: "Nearby responder",
        authority: "EMS / Traffic or Police",
        note:
            "SAHAAYA searches for suitable nearby assistance while serious accidents may require official services."
    },

    Danger: {
        mode: "Nearby security responder",
        authority: "Police / Emergency Services when required",
        note:
            "SAHAAYA searches for verified security responders nearby."
    },

    Electrical: {
        mode: "Nearby electrician",
        authority: "Electricity utility / Emergency Services",
        note:
            "SAHAAYA searches for a verified electrician nearby."
    },

    Other: {
        mode: "Nearby assistance",
        authority: "Based on emergency",
        note:
            "SAHAAYA uses the emergency description to determine the current response category."
    }
};


/* 
   EMERGENCY OPTIONS
 */

const emergencyOptions = {

    Medical: [
        "Person unconscious",
        "Severe bleeding",
        "Breathing difficulty",
        "Chest pain",
        "Other medical emergency"
    ],

    Fire: [
        "Building fire",
        "Vehicle fire",
        "Smoke / possible fire",
        "Forest / outdoor fire",
        "Other fire emergency"
    ],

    Accident: [
        "Road accident",
        "Vehicle collision",
        "Person injured",
        "Multiple people injured",
        "Other accident"
    ],

    Danger: [
        "Person in danger",
        "Suspicious activity",
        "Violence / threat",
        "Missing or vulnerable person",
        "Other danger"
    ],

    Electrical: [
        "Power line hazard",
        "Electrical fire",
        "Electric shock",
        "Sparking / exposed wire",
        "Other electrical emergency"
    ],

    Other: [
        "Locked out / stuck",
        "Need nearby assistance",
        "Missing person",
        "General emergency",
        "Describe the emergency"
    ]
};


/* 
   SCREEN MANAGEMENT
 */

function showScreen(screenId) {

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(function(screen) {

        screen.classList.remove("active");

    });

    const target =
        document.getElementById(screenId);

    if (target) {

        target.classList.add("active");

        window.scrollTo(0, 0);
    }
}


function goHome() {

    selectedCategory = "";
    selectedEmergency = "";
    customEmergencyDescription = "";

    emergencyId = null;
    currentHelper = null;
    matchedHelpers = [];

    currentRadius = 150;

    showScreen("home");
}


function openHowItWorks() {

    showScreen("how-it-works");
}


/* 
   CATEGORY SELECTION
 */

function selectCategory(category) {

    selectedCategory = category;

    const iconMap = {

        Medical: "🩺",
        Fire: "🔥",
        Accident: "🚗",
        Danger: "🛡️",
        Electrical: "⚡",
        Other: "🆘"

    };

    const icon =
        document.getElementById("categoryIcon");

    if (icon) {

        icon.textContent =
            iconMap[category] || "🚨";
    }


    const title =
        document.getElementById("categoryTitle");

    if (title) {

        title.textContent =
            category === "Other"
                ? "What kind of help do you need?"
                : `${category} Emergency`;
    }


    const container =
        document.getElementById(
            "emergencyOptions"
        );

    container.innerHTML = "";


    emergencyOptions[category].forEach(
        function(option) {

            const button =
                document.createElement("button");

            button.className =
                "option-btn";

            button.textContent =
                option;


            button.onclick =
                function() {

                    if (
                        category === "Other" &&
                        option === "Describe the emergency"
                    ) {

                        showScreen(
                            "other-description"
                        );

                        return;
                    }


                    selectedEmergency =
                        option;

                    customEmergencyDescription =
                        option;


                    showConfirmation();
                };


            container.appendChild(button);
        }
    );


    showScreen("category");
}


/* 
   CUSTOM EMERGENCY
 */

function continueCustomEmergency() {

    const input =
        document.getElementById(
            "customDescription"
        );

    const description =
        input.value.trim();


    if (!description) {

        alert(
            "Please describe what is happening."
        );

        return;
    }


    customEmergencyDescription =
        description;

    selectedEmergency =
        "Other emergency";


    showConfirmation();
}


/* 
   RESPONSE PLAN
 */

function getResponsePlan(category) {

    return (
        RESPONSE_PLANS[category] ||
        RESPONSE_PLANS.Other
    );
}


/* 
   CONFIRMATION
 */

function showConfirmation() {

    const emergencyElement =
        document.getElementById(
            "confirmEmergency"
        );

    const descriptionElement =
        document.getElementById(
            "confirmDescription"
        );

    const modeElement =
        document.getElementById(
            "confirmResponseMode"
        );

    const authorityElement =
        document.getElementById(
            "confirmAuthority"
        );

    const noteElement =
        document.getElementById(
            "responsePlanNote"
        );


    if (emergencyElement) {

        emergencyElement.textContent =
            selectedEmergency ||
            selectedCategory;
    }


    if (descriptionElement) {

        descriptionElement.textContent =
            customEmergencyDescription ||
            selectedEmergency ||
            "Emergency reported";
    }


    const plan =
        getResponsePlan(
            selectedCategory
        );


    if (modeElement) {

        modeElement.textContent =
            plan.mode;
    }


    if (authorityElement) {

        authorityElement.textContent =
            plan.authority;
    }


    if (noteElement) {

        noteElement.textContent =
            plan.note;
    }


    showScreen("confirmation");
}


/* 
   BACKEND CATEGORY
 */

function getBackendCategory() {

    const categoryMap = {

        Medical: "medical",
        Fire: "fire",
        Accident: "accident",
        Danger: "danger",
        Electrical: "electrical",
        Other: "other"

    };


    return (
        categoryMap[selectedCategory] ||
        "other"
    );
}


/* 
   REQUIRED SKILL
 */

function getRequiredSkill() {
    const text = (selectedEmergency || customEmergencyDescription || "").toLowerCase();

    // Missing or vulnerable person → security responder
    if (
        text.includes("missing") ||
        text.includes("vulnerable")
    ) {
        return "security";
    }

    // Electrical emergencies → electrician
    if (
        text.includes("electrical") ||
        text.includes("wire") ||
        text.includes("power") ||
        text.includes("sparking")
    ) {
        return "electrician";
    }

    // Fire emergencies → fire responder
    if (
        text.includes("fire") ||
        text.includes("smoke")
    ) {
        return "fire_responder";
    }

    // Danger/security emergencies → security responder
    if (
        text.includes("danger") ||
        text.includes("security") ||
        text.includes("violence") ||
        text.includes("threat")
    ) {
        return "security";
    }

    // Medical/other emergencies → first aid
    return "first_aid";
}

/* 
   SEVERITY
 */

function getSeverity() {

    const text =
        `${selectedCategory} ${selectedEmergency} ${customEmergencyDescription}`
            .toLowerCase();


    if (
        text.includes("unconscious") ||
        text.includes("not breathing") ||
        text.includes("severe bleeding") ||
        text.includes("critical")
    ) {

        return "critical";
    }


    if (
        text.includes("fire") ||
        text.includes("injured") ||
        text.includes("accident") ||
        text.includes("electric shock") ||
        text.includes("chest pain") ||
        text.includes("breathing")
    ) {

        return "high";
    }


    return "medium";
}


/* 
   GET USER LOCATION
 */

function getUserLocation() {

    return new Promise(
        function(resolve, reject) {

            if (!navigator.geolocation) {

                reject(
                    new Error(
                        "Geolocation is not supported by this browser."
                    )
                );

                return;
            }


            navigator.geolocation.getCurrentPosition(

                function(position) {

                    resolve({

                        latitude:
                            12.9716,

                        longitude:
                            77.5946

                    });
                },


                function(error) {

                    reject(error);
                },


                {

                    enableHighAccuracy:
                        true,

                    timeout:
                        10000,

                    maximumAge:
                        0
                }
            );
        }
    );
}


/* 
   CREATE EMERGENCY
 */

async function createEmergency(location) {

    const payload = {

        category:
            getBackendCategory(),

        severity:
            getSeverity(),

        required_skill:
            getRequiredSkill(),

        description:
            customEmergencyDescription ||
            selectedEmergency ||
            "Emergency reported",

        latitude:
            location.latitude,

        longitude:
            location.longitude
    };


    console.log(
        "Sending emergency:",
        payload
    );


    const response =
        await fetch(
            `${API_BASE_URL}/emergency`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(payload)
            }
        );


    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Emergency creation failed (${response.status}): ${errorText}`
        );
    }


    const data =
        await response.json();


    console.log(
        "Emergency created:",
        data
    );


    /*
       This exactly matches Person 1's backend:

       {
           "message": "Emergency created successfully",
           "emergency_id": 1,
           "status": "pending"
       }
    */

    emergencyId =
        data.emergency_id;


    if (!emergencyId) {

        throw new Error(
            "Backend did not return emergency_id."
        );
    }


    return data;
}


/* 
   REQUEST HELP
 */

async function requestHelp() {

    showScreen(
        "finding-help"
    );


    currentRadius = 150;

    updateRadiusUI();


    try {

        /*
           STEP 1:
           Get location.
        */

        const location =
            await getUserLocation();


        /*
           STEP 2:
           Save emergency in MySQL.
        */

        await createEmergency(
            location
        );


        /*
           STEP 3:
           Ask backend matching system
           for suitable helpers.
        */

        await findHelpers();

    }

    catch (error) {

        console.error(
            "Emergency error:",
            error
        );


        const message =
            document.getElementById(
                "findingMessage"
            );


        if (message) {

            message.textContent =
                "Could not create the emergency.";
        }


        alert(
            "Could not create the emergency. Make sure Person 1's FastAPI server is running and the API address is correct."
        );


        goHome();
    }
}


/* 
   FIND HELPERS
 */

async function findHelpers() {

    if (!emergencyId) {

        alert(
            "Emergency ID is missing."
        );

        return;
    }


    const message =
        document.getElementById(
            "findingMessage"
        );


    if (message) {

        message.textContent =
            "Searching for suitable nearby responders...";
    }


    try {

        /*
           Person 1's endpoint calls:

           progressively_match_emergency(
               emergency_id
           )

           which checks:

           150m
           300m
           500m
           1km

           and returns up to 3 helpers.
        */

        const response =
            await fetch(
                `${API_BASE_URL}/emergency/${emergencyId}/helpers`
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `Helper search failed (${response.status}): ${errorText}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Matching result:",
            data
        );


        matchedHelpers =
            data.helpers || [];


        /* ---------------------------------------------
           MATCH FOUND
        --------------------------------------------- */

        if (
            matchedHelpers.length > 0
        ) {

            /*
               Backend orders helpers by distance.

               So helpers[0] is the closest
               suitable verified available helper.
            */

            currentHelper =
                matchedHelpers[0];


            showHelperFound(
                currentHelper
            );


            return;
        }


        /* ---------------------------------------------
           NO MATCH
        --------------------------------------------- */

        showNoHelperFound();

    }

    catch (error) {

        console.error(
            "Matching error:",
            error
        );


        if (message) {

            message.textContent =
                "Unable to search for responders.";
        }


        alert(
            "The emergency was created, but responder matching could not be completed."
        );
    }
}


/* 
   SHOW MATCHED HELPER
 */

function showHelperFound(helper) {

    /*
       Exact fields returned by matching.py:

       helper_id
       name
       phone
       skill
       distance_km
    */


    const helperId =
        helper.helper_id;


    const helperName =
        helper.name ||
        "Responder";


    const helperSkill =
        helper.skill ||
        "Suitable responder";


    const distanceKm =
        helper.distance_km;


    currentHelper =
        helper;


    console.log(
        "Selected helper:",
        currentHelper
    );


    const nameElement =
        document.getElementById(
            "helperName"
        );


    if (nameElement) {

        nameElement.textContent =
            helperName;
    }


    const skillElement =
        document.getElementById(
            "helperSkill"
        );


    if (skillElement) {

        skillElement.textContent =
            helperSkill;
    }


    const distanceElement =
        document.getElementById(
            "helperDistance"
        );


    if (distanceElement) {

        distanceElement.textContent =
            formatDistanceKm(
                distanceKm
            );
    }


    showScreen(
        "helper-found"
    );


    speakStatusUpdate(
        `${helperName} is the closest suitable responder found by SAHAAYA.`
    );
}


/* 
   NO HELPER
 */

function showNoHelperFound() {

    const message =
        document.getElementById(
            "findingMessage"
        );


    if (message) {

        message.textContent =
            "No suitable verified responder was found within 1 kilometre.";
    }


    /*
       IMPORTANT:

       We do NOT pretend that SAHAAYA contacted
       police, fire services, EMS, etc.

       Your current backend does not contain
       an official-authority API.

       We only show the recommendation.
    */

    setTimeout(
        function() {

            showScreen(
                "authority-escalation"
            );


            const emergencyElement =
                document.getElementById(
                    "authorityEmergency"
                );


            if (emergencyElement) {

                emergencyElement.textContent =
                    selectedEmergency ||
                    selectedCategory;
            }


            const authorityElement =
                document.getElementById(
                    "authorityName"
                );


            if (authorityElement) {

                authorityElement.textContent =
                    getResponsePlan(
                        selectedCategory
                    ).authority;
            }


            const messageElement =
                document.getElementById(
                    "authorityMessage"
                );


            if (messageElement) {

                messageElement.textContent =
                    "No suitable verified responder was found within SAHAAYA's current 1 km matching range. Please contact official emergency services if required.";
            }


        },
        1000
    );
}


/* 
   DISTANCE FORMATTING
 */

function formatDistanceKm(
    distanceKm
) {

    if (
        distanceKm === null ||
        distanceKm === undefined ||
        isNaN(distanceKm)
    ) {

        return "Nearby";
    }


    const km =
        Number(distanceKm);


    if (km < 1) {

        return `${Math.round(
            km * 1000
        )} m`;
    }


    return `${km.toFixed(2)} km`;
}


function updateRadiusUI() {

    const radiusElement =
        document.getElementById(
            "radiusValue"
        );


    if (radiusElement) {

        radiusElement.textContent =
            formatDistanceKm(
                currentRadius / 1000
            );
    }


    const statusRadius =
        document.getElementById(
            "statusRadius"
        );


    if (statusRadius) {

        statusRadius.textContent =
            formatDistanceKm(
                currentRadius / 1000
            );
    }
}


/* 
   ACCEPT EMERGENCY
 */

async function simulateResponderAccept(selectedEmergencyId) {

    /*
       Use the emergency ID from the responder's
       emergency card.

       Fallbacks are included for safety.
    */

    const idToAccept =
        selectedEmergencyId ||
        (
            currentResponderEmergency &&
            currentResponderEmergency.emergency_id
        ) ||
        emergencyId;


    if (!idToAccept) {

        alert(
            "Emergency ID is missing."
        );

        console.error(
            "No emergency_id available for acceptance."
        );

        return false;
    }


    if (!responder || !responder.helper_id) {

        alert(
            "Responder ID is missing."
        );

        return false;
    }


    const helperId =
        responder.helper_id;


    console.log(
        "Accepting emergency:",
        idToAccept,
        "with helper:",
        helperId
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/match/${encodeURIComponent(idToAccept)}/accept?helper_id=${encodeURIComponent(helperId)}`,
                {
                    method: "POST"
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `Accept failed (${response.status}): ${errorText}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Acceptance response:",
            data
        );


        /*
           Keep the accepted emergency ID.
        */

        emergencyId =
            Number(idToAccept);


        return true;

    }

    catch (error) {

        console.error(
            "Accept error:",
            error
        );


        alert(
            "Could not accept the emergency. Please try again."
        );


        return false;
    }
}


/* 
   RESPONDER ACCEPT BUTTON
 */

async function acceptEmergency() {

    /*
       THIS is the important part.

       Get the ID from the emergency returned by:

       GET /helper/{helper_id}/emergencies
    */

    const selectedEmergencyId =
        currentResponderEmergency &&
        currentResponderEmergency.emergency_id;


    console.log(
        "Accept button clicked.",
        "Emergency ID:",
        selectedEmergencyId
    );


    const accepted =
        await simulateResponderAccept(
            selectedEmergencyId
        );


    if (!accepted) {

        return;
    }


    showScreen(
        "responder-accepted"
    );
}


/* 
   RESPONDER DECLINE
 */

function declineEmergency() {

    /*
       There is currently NO decline endpoint
       in Person 1's backend.

       So we only change the frontend screen.
    */

    showScreen(
        "responder-declined"
    );
}


/* 
   VOICE INPUT
 */

/*
   Temporary browser voice input.

   ElevenLabs should later be connected through
   a backend endpoint.

   NEVER put an ElevenLabs API key in frontend code.
*/

function speakEmergency() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Voice recognition is not supported in this browser."
        );

        return;
    }


    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";


    recognition.interimResults =
        false;


    recognition.maxAlternatives =
        1;


    recognition.onstart =
        function() {

            alert(
                "Speak your emergency now."
            );
        };


    recognition.onresult =
        function(event) {

            const transcript =
                event.results[0][0]
                    .transcript
                    .trim();


            selectedCategory =
                "Other";


            selectedEmergency =
                "Voice emergency";


            customEmergencyDescription =
                transcript;


            showConfirmation();
        };


    recognition.onerror =
        function(event) {

            console.error(
                "Voice recognition error:",
                event.error
            );


            alert(
                "Voice input could not be captured."
            );
        };


    recognition.start();
}


/* 
   VOICE OUTPUT
 */

function speakStatusUpdate(text) {

    /*
       Temporary browser speech.

       ElevenLabs can replace this later through
       a secure backend endpoint.
    */

    if (
        "speechSynthesis" in window
    ) {

        const utterance =
            new SpeechSynthesisUtterance(
                text
            );


        utterance.lang =
            "en-IN";


        window.speechSynthesis.speak(
            utterance
        );
    }
}


/* 
   REAL RESPONDER / HELPER
 */

let responder = {
    helper_id: null,
    name: "",
    phone: "",
    skill: "",
    verified: false,
    available: false,
    latitude: null,
    longitude: null
};


/* 
   RESPONDER ENTRY
 */

function openResponderEntry() {

    showScreen(
        "responder-entry"
    );
}


/* 
   RESPONDER LOGIN
 */

async function openResponderLogin() {

    const input =
        prompt("Enter your Helper ID:");


    if (!input) {

        return;
    }


    const helperId =
        Number(input.trim());


    if (
        !Number.isInteger(helperId) ||
        helperId <= 0
    ) {

        alert(
            "Please enter a valid Helper ID."
        );

        return;
    }


    try {

        /*
           Get the real responder from Person 1's backend.
        */

        const response =
            await fetch(
                `${API_BASE_URL}/helper/${helperId}`
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `Helper lookup failed (${response.status}): ${errorText}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Real helper loaded:",
            data
        );


        responder = {

            helper_id:
                data.helper_id,

            name:
                data.name || "Responder",

            phone:
                data.phone || "",

            skill:
                data.skill || "Responder",

            verified:
                Boolean(data.verified),

            available:
                Boolean(data.available),

            latitude:
                data.latitude ?? null,

            longitude:
                data.longitude ?? null
        };


        if (!responder.verified) {

            alert(
                "This helper is not verified yet."
            );

            return;
        }


        /*
           IMPORTANT:
           Open dashboard and fetch this helper's
           emergency list.
        */

        await openResponderDashboard();

    }

    catch (error) {

        console.error(
            "Responder login error:",
            error
        );


        alert(
            "Could not find this Helper ID. Please check the ID and make sure Person 1's backend is running."
        );
    }
}


/* 
   FETCH RESPONDER EMERGENCIES
 */

async function fetchResponderEmergencies() {

    if (!responder.helper_id) {

        console.error(
            "No helper_id available."
        );

        return [];
    }


    try {

        /*
           Person 1's endpoint:

           GET /helper/{helper_id}/emergencies
        */

        const response =
            await fetch(
                `${API_BASE_URL}/helper/${responder.helper_id}/emergencies`
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `Emergency lookup failed (${response.status}): ${errorText}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Responder emergencies:",
            data
        );


        /*
           Support either:

           [
               {...},
               {...}
           ]

           OR:

           {
               "emergencies": [...]
           }
        */

        if (Array.isArray(data)) {

            responderEmergencies =
                data;

        }

        else if (
            data &&
            Array.isArray(data.emergencies)
        ) {

            responderEmergencies =
                data.emergencies;

        }

        else {

            responderEmergencies =
                [];
        }


        /*
           Select the first emergency returned
           by the backend.
        */

        if (
            responderEmergencies.length > 0
        ) {

            currentResponderEmergency =
                responderEmergencies[0];


            /*
               ⭐ THIS FIXES YOUR ERROR ⭐

               Store the backend emergency_id.
            */

            emergencyId =
                currentResponderEmergency.emergency_id;


            console.log(
                "Current responder emergency ID:",
                emergencyId
            );

        }

        else {

            currentResponderEmergency =
                null;

            emergencyId =
                null;
        }


        return responderEmergencies;

    }

    catch (error) {

        console.error(
            "Could not fetch responder emergencies:",
            error
        );


        responderEmergencies =
            [];

        currentResponderEmergency =
            null;

        emergencyId =
            null;


        return [];
    }
}


/* 
   DISPLAY RESPONDER EMERGENCY
 */

function displayResponderEmergency(
    emergency
) {

    if (!emergency) {

        return;
    }


    /*
       Store the COMPLETE object.

       This includes emergency_id.
    */

    currentResponderEmergency =
        emergency;


    emergencyId =
        emergency.emergency_id;


    console.log(
        "Displaying emergency:",
        emergency
    );


    const emergencyCard =
        document.getElementById(
            "incomingEmergency"
        );


    if (!emergencyCard) {

        return;
    }


    /* ---------------------------------------------
       CATEGORY
    --------------------------------------------- */

    const emergencyType =
        emergencyCard.querySelector(
            ".emergency-type"
        );


    if (emergencyType) {

        const category =
            emergency.category ||
            "Emergency";


        emergencyType.textContent =
            `🚨 ${formatEmergencyCategory(category)}`;
    }


    /* ---------------------------------------------
       SEVERITY
    --------------------------------------------- */

    const severity =
        emergencyCard.querySelector(
            ".severity"
        );


    if (severity) {

        severity.textContent =
            `⚠️ ${(emergency.severity || "medium").toUpperCase()}`;
    }


    /* ---------------------------------------------
       DESCRIPTION
    --------------------------------------------- */

    const description =
        emergencyCard.querySelector(
            ".emergency-description"
        );


    if (description) {

        description.textContent =
            emergency.description ||
            "Emergency reported nearby.";
    }


    /* ---------------------------------------------
       DETAILS
    --------------------------------------------- */

    const detailBlocks =
        emergencyCard.querySelectorAll(
            ".emergency-details > div"
        );


    if (detailBlocks.length >= 3) {

        const skillStrong =
            detailBlocks[0].querySelector(
                "strong"
            );


        const distanceStrong =
            detailBlocks[1].querySelector(
                "strong"
            );


        if (skillStrong) {

            skillStrong.textContent =
                responder.skill ||
                "Suitable responder";
        }


        if (distanceStrong) {

            distanceStrong.textContent =
                formatDistanceKm(
                    emergency.distance_km
                );
        }
    }


    console.log(
        "Emergency card connected to ID:",
        emergencyId
    );
}


/* 
   FORMAT CATEGORY
 */

function formatEmergencyCategory(
    category
) {

    if (!category) {

        return "Emergency";
    }


    return (
        category.charAt(0).toUpperCase() +
        category.slice(1).toLowerCase() +
        " Emergency"
    );
}


/* 
   RESPONDER DASHBOARD
 */

async function openResponderDashboard() {

    if (!responder.helper_id) {

        alert(
            "No responder is currently logged in."
        );

        return;
    }


    if (!responder.verified) {

        alert(
            "This responder is not verified."
        );

        return;
    }


    const welcome =
        document.getElementById(
            "responderWelcome"
        );


    if (welcome) {

        welcome.textContent =
            `Welcome, ${responder.name}`;
    }


    const toggle =
        document.getElementById(
            "availabilityToggle"
        );


    if (toggle) {

        toggle.checked =
            responder.available;
    }


    updateAvailabilityUI();


    /*
       ⭐ IMPORTANT ⭐

       Fetch emergencies specifically for
       the logged-in responder.
    */

    await fetchResponderEmergencies();


    const incoming =
        document.getElementById(
            "incomingEmergency"
        );


    const none =
        document.getElementById(
            "noEmergency"
        );


    if (
        responder.available &&
        currentResponderEmergency
    ) {

        displayResponderEmergency(
            currentResponderEmergency
        );


        if (incoming) {

            incoming.classList.remove(
                "hidden"
            );
        }


        if (none) {

            none.classList.add(
                "hidden"
            );
        }

    }

    else {

        if (incoming) {

            incoming.classList.add(
                "hidden"
            );
        }


        if (none) {

            none.classList.remove(
                "hidden"
            );
        }
    }


    showScreen(
        "responder-dashboard"
    );
}


/* 
   AVAILABILITY
 */

async function toggleAvailability() {

    const toggle =
        document.getElementById(
            "availabilityToggle"
        );


    if (
        !toggle ||
        !responder.helper_id
    ) {

        return;
    }


    const newAvailability =
        toggle.checked;


    toggle.disabled = true;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/helper/${responder.helper_id}/availability`,
                {

                    method: "PATCH",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            available:
                                newAvailability
                        })
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `Availability update failed (${response.status}): ${errorText}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Availability updated:",
            data
        );


        responder.available =
            Boolean(data.available);


        toggle.checked =
            responder.available;


        updateAvailabilityUI();


        const incoming =
            document.getElementById(
                "incomingEmergency"
            );


        const none =
            document.getElementById(
                "noEmergency"
            );


        if (
            responder.available &&
            currentResponderEmergency
        ) {

            if (incoming) {

                incoming.classList.remove(
                    "hidden"
                );
            }


            if (none) {

                none.classList.add(
                    "hidden"
                );
            }

        }

        else {

            if (incoming) {

                incoming.classList.add(
                    "hidden"
                );
            }


            if (none) {

                none.classList.remove(
                    "hidden"
                );
            }
        }

    }

    catch (error) {

        console.error(
            "Availability error:",
            error
        );


        toggle.checked =
            responder.available;


        alert(
            "Could not update your availability. Please try again."
        );
    }

    finally {

        toggle.disabled = false;
    }
}


/* 
   AVAILABILITY UI
 */

function updateAvailabilityUI() {

    const badge =
        document.getElementById(
            "availabilityBadge"
        );


    const message =
        document.getElementById(
            "availabilityMessage"
        );


    if (!badge || !message) {

        return;
    }


    if (
        responder.available
    ) {

        badge.className =
            "availability-badge available";


        badge.textContent =
            "🟢 AVAILABLE";


        message.textContent =
            "You may receive nearby emergencies.";

    }

    else {

        badge.className =
            "availability-badge unavailable";


        badge.textContent =
            "⚪ UNAVAILABLE";


        message.textContent =
            "You will not receive new emergency requests.";
    }
}


/* 
   RESPONDER LOGOUT
 */

function logoutResponder() {

    responder = {

        helper_id: null,
        name: "",
        phone: "",
        skill: "",
        verified: false,
        available: false,
        latitude: null,
        longitude: null
    };


    responderEmergencies =
        [];

    currentResponderEmergency =
        null;

    emergencyId =
        null;


    showScreen(
        "home"
    );
}


/* 
   NAVIGATION
 */

function navigateToEmergency() {

    showScreen(
        "navigation"
    );
}


/* 
   INITIAL LOAD
 */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        goHome();


        const professionSelect =
            document.getElementById(
                "responderProfession"
            );


        if (professionSelect) {

            updateVerificationRequirement();
        }
    }
);
