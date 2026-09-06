/* =====================================================
   SAHAAYA FRONTEND
   =====================================================

   NOTE:

   The emergency matching below is still DEMO logic.

   Once Person 1 provides the FastAPI endpoints,
   requestHelp(), responder matching and acceptEmergency()
   will be connected to the real backend.

===================================================== */


/* =========================
   GLOBAL STATE
========================= */

let selectedCategory = "";
let selectedEmergency = "";
let customEmergencyDescription = "";

let currentRadius = 150;

let responder = {
    name: "",
    phone: "",
    profession: "",
    skills: "",
    area: "",
    verified: false,
    available: false
};


/* =========================
   EMERGENCY OPTIONS
========================= */

const emergencyOptions = {

    Medical: [
        "👤 Someone is unconscious",
        "🤕 Someone is injured",
        "😣 Severe pain",
        "🫁 Breathing problem",
        "❓ Other"
    ],

    Fire: [
        "🏠 Building fire",
        "🚗 Vehicle fire",
        "⚡ Electrical fire",
        "💨 Smoke detected",
        "❓ Other"
    ],

    Accident: [
        "🚗 Road accident",
        "💥 Vehicle collision",
        "🤕 Person injured",
        "🆘 Person trapped",
        "❓ Other"
    ],

    Danger: [
        "🆘 Person in danger",
        "⚠️ Violence",
        "👀 Suspicious situation",
        "🔎 Missing person",
        "❓ Other"
    ],

    Electrical: [
        "⚡ Electric shock",
        "✨ Sparking",
        "🔌 Fallen wire",
        "💡 Power failure",
        "❓ Other"
    ],

    Other: [
        "🆘 Need immediate help",
        "👶 Child assistance",
        "👵 Elderly assistance",
        "🔎 Lost person",
        "❓ Other"
    ]
};


/* =========================
   CATEGORY ICONS
========================= */

const categoryIcons = {

    Medical: "🩺",
    Fire: "🔥",
    Accident: "🚗",
    Danger: "🛡️",
    Electrical: "⚡",
    Other: "🆘"

};


/* =========================
   SCREEN CONTROL
========================= */

function showScreen(screenId) {

    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.remove("active");
    });


    const target = document.getElementById(screenId);

    if (target) {
        target.classList.add("active");
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   HOME
========================= */

function goHome() {

    selectedCategory = "";
    selectedEmergency = "";
    customEmergencyDescription = "";

    showScreen("home");
}


/* =========================
   HOW IT WORKS
========================= */

function openHowItWorks() {

    showScreen("how-it-works");

}


/* =========================
   CATEGORY SELECTION
========================= */

function selectCategory(category) {

    selectedCategory = category;

    document.getElementById("categoryIcon").textContent =
        categoryIcons[category] || "🚨";

    document.getElementById("categoryTitle").textContent =
        `${category} Emergency`;

    const optionsContainer =
        document.getElementById("emergencyOptions");

    optionsContainer.innerHTML = "";


    const options = emergencyOptions[category] || [];


    options.forEach(option => {

        const button =
            document.createElement("button");

        button.className = "option-btn";

        button.textContent = option;

        button.onclick = function () {

            selectEmergencyOption(option);

        };


        optionsContainer.appendChild(button);

    });


    showScreen("category");
}


/* =========================
   EMERGENCY OPTION
========================= */

function selectEmergencyOption(option) {

    if (option.includes("Other")) {

        showScreen("other-description");

        document.getElementById("customDescription").value = "";

        return;
    }


    selectedEmergency = option;

    showConfirmation();
}


/* =========================
   CUSTOM EMERGENCY
========================= */

function continueCustomEmergency() {

    const description =
        document.getElementById("customDescription")
            .value
            .trim();


    if (!description) {

        alert("Please describe what is happening.");

        return;
    }


    customEmergencyDescription = description;

    selectedEmergency =
        "Other: " + description;


    showConfirmation();
}


/* =========================
   CONFIRMATION
========================= */

function showConfirmation() {

    document.getElementById("confirmEmergency")
        .textContent = selectedCategory;


    document.getElementById("confirmDescription")
        .textContent = selectedEmergency;


    showScreen("confirmation");
}


/* =========================
   REQUEST HELP
========================= */

function requestHelp() {

    currentRadius = 150;


    document.getElementById("radiusValue")
        .textContent = "150 m";


    document.getElementById("findingMessage")
        .textContent =
        "Searching for nearby responders...";


    resetFindingTracker();


    showScreen("finding-help");


    /*
       DEMO FLOW

       Later this will become:

       POST /emergency

       Backend then performs:

       AI classification
       ↓
       Database lookup
       ↓
       Skill matching
       ↓
       Distance calculation
       ↓
       Responder notification
    */


    setTimeout(() => {

        currentRadius = 300;

        document.getElementById("radiusValue")
            .textContent = "300 m";

        document.getElementById("findingMessage")
            .textContent =
            "No response. Expanding search to 300 m...";

    }, 1000);


    setTimeout(() => {

        currentRadius = 500;

        document.getElementById("radiusValue")
            .textContent = "500 m";

        document.getElementById("findingMessage")
            .textContent =
            "Searching a wider area...";


    }, 2000);


    setTimeout(() => {

        activateFindingResponder();


    }, 3000);


    setTimeout(() => {

        showHelperFound();

    }, 4000);

}


/* =========================
   FINDING TRACKER
========================= */

function resetFindingTracker() {

    const responderTracker =
        document.getElementById("trackerResponder");

    const connectTracker =
        document.getElementById("trackerConnect");


    responderTracker.classList.remove("active");
    connectTracker.classList.remove("active");


    responderTracker.querySelector(".status-dot")
        .textContent = "3";

    connectTracker.querySelector(".status-dot")
        .textContent = "4";
}


function activateFindingResponder() {

    const responderTracker =
        document.getElementById("trackerResponder");


    responderTracker.classList.add("active");


    responderTracker.querySelector(".status-dot")
        .textContent = "✓";
}


/* =========================
   HELPER FOUND
========================= */

function showHelperFound() {

    const helperData =
        getDemoHelper(selectedCategory);


    document.getElementById("helperName")
        .textContent = helperData.name;


    document.getElementById("helperSkill")
        .textContent =
        "🩺 Skill: " + helperData.skill;


    document.getElementById("helperDistance")
        .textContent =
        helperData.distance + " m";


    showScreen("helper-found");
}


/* =========================
   DEMO HELPER
========================= */

function getDemoHelper(category) {

    const helpers = {

        Medical: {
            name: "First-Aid Responder",
            skill: "First Aid",
            distance: 280
        },

        Fire: {
            name: "Fire Response Volunteer",
            skill: "Fire Response",
            distance: 320
        },

        Accident: {
            name: "Emergency Responder",
            skill: "Accident Response",
            distance: 250
        },

        Danger: {
            name: "Safety Responder",
            skill: "Safety Assistance",
            distance: 300
        },

        Electrical: {
            name: "Electrical Responder",
            skill: "Electrical Assistance",
            distance: 220
        },

        Other: {
            name: "Community Responder",
            skill: "General Assistance",
            distance: 280
        }

    };


    return helpers[category] || helpers.Other;
}


/* =========================
   DEMO RESPONDER ACCEPT
========================= */

function simulateResponderAccept() {

    const helper =
        getDemoHelper(selectedCategory);


    document.getElementById("acceptedResponderName")
        .textContent = helper.name;


    const connectTracker =
        document.getElementById("trackerConnect");


    connectTracker.classList.add("active");


    connectTracker.querySelector(".status-dot")
        .textContent = "✓";


    showScreen("emergency-status");
}


/* =========================
   SPEAK
========================= */

function speakEmergency() {

    alert(
        "Voice input to be connected to AI/voice services later."
    );

}


/* =========================
   RESPONDER ENTRY
========================= */

function openResponderEntry() {

    showScreen("responder-entry");

}


/* =========================
   RESPONDER LOGIN
========================= */

function openResponderLogin() {

    /*
       DEMO LOGIN

       Later this becomes actual authentication
       through the backend.
    */


    if (!responder.verified) {

        responder = {

            name: "Demo Responder",
            phone: "0000000000",
            profession: "First-Aid Volunteer",
            skills: "First Aid",
            area: "Demo Area",

            verified: true,
            available: true

        };

    }


    openResponderDashboard();
}


/* =========================
   REGISTRATION
========================= */

function openResponderRegistration() {

    showScreen("responder-registration");

}


/* =========================
   SUBMIT REGISTRATION
========================= */

function submitRegistration() {

    const name =
        document.getElementById("responderName")
            .value
            .trim();


    const phone =
        document.getElementById("responderPhone")
            .value
            .trim();


    const profession =
        document.getElementById("responderProfession")
            .value;


    const skills =
        document.getElementById("responderSkills")
            .value
            .trim();


    const area =
        document.getElementById("responderArea")
            .value
            .trim();


    if (
        !name ||
        !phone ||
        !profession ||
        !skills ||
        !area
    ) {

        alert("Please fill in all fields.");

        return;
    }


    responder = {

        name,
        phone,
        profession,
        skills,
        area,

        verified: false,
        available: false

    };


    showScreen("verification-pending");
}


/* =========================
   DEMO VERIFICATION
========================= */

function simulateVerification() {

    responder.verified = true;

    responder.available = true;


    alert(
        "Demo verification complete. You are now a verified responder."
    );


    openResponderDashboard();
}


/* =========================
   RESPONDER DASHBOARD
========================= */

function openResponderDashboard() {

    if (!responder.verified) {

        alert(
            "Your responder profile has not been verified yet."
        );

        showScreen("verification-pending");

        return;
    }


    document.getElementById("responderWelcome")
        .textContent =
        `Welcome, ${responder.name}`;


    document.getElementById("availabilityToggle")
        .checked = responder.available;


    updateAvailabilityUI();


    /*
       Demo:
       Show incoming emergency only when available.
    */

    if (responder.available) {

        document.getElementById("incomingEmergency")
            .classList.remove("hidden");

        document.getElementById("noEmergency")
            .classList.add("hidden");

    } else {

        document.getElementById("incomingEmergency")
            .classList.add("hidden");

        document.getElementById("noEmergency")
            .classList.remove("hidden");

    }


    showScreen("responder-dashboard");
}


/* =========================
   AVAILABILITY
========================= */

function toggleAvailability() {

    if (!responder.verified) {

        alert(
            "Only verified responders can change availability."
        );

        document.getElementById("availabilityToggle")
            .checked = false;

        return;
    }


    responder.available =
        document.getElementById("availabilityToggle")
            .checked;


    updateAvailabilityUI();


    if (responder.available) {

        document.getElementById("incomingEmergency")
            .classList.remove("hidden");

        document.getElementById("noEmergency")
            .classList.add("hidden");

    } else {

        document.getElementById("incomingEmergency")
            .classList.add("hidden");

        document.getElementById("noEmergency")
            .classList.remove("hidden");

    }
}


/* =========================
   AVAILABILITY UI
========================= */

function updateAvailabilityUI() {

    const badge =
        document.getElementById("availabilityBadge");


    const message =
        document.getElementById("availabilityMessage");


    if (responder.available) {

        badge.className =
            "availability-badge available";

        badge.textContent =
            "🟢 AVAILABLE";


        message.textContent =
            "You may receive nearby emergencies.";

    } else {

        badge.className =
            "availability-badge unavailable";

        badge.textContent =
            "⚪ UNAVAILABLE";


        message.textContent =
            "You will not receive new emergency requests.";

    }
}


/* =========================
   ACCEPT EMERGENCY
========================= */

function acceptEmergency() {

    if (!responder.available) {

        alert(
            "You are currently unavailable."
        );

        return;
    }


    showScreen("responder-accepted");
}


/* =========================
   DECLINE EMERGENCY
========================= */

function declineEmergency() {

    showScreen("responder-declined");

}


/* =========================
   NAVIGATION
========================= */

function navigateToEmergency() {

    showScreen("navigation");

}


/* =========================
   INITIAL LOAD
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        goHome();

    }
);