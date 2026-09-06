/*  
   SAHAAYA FRONTEND
   REAL BACKEND INTEGRATION
  */


/*  
   BACKEND CONFIG
  */

const API_BASE_URL = "http://172.18.227.245:8000";


/*  
   GLOBAL STATE
  */

let selectedCategory = "";
let selectedEmergency = "";
let customEmergencyDescription = "";

let currentRadius = 150;

let emergencyId = null;
let currentHelper = null;

let responder = {
    name: "",
    phone: "",
    profession: "",
    skills: "",
    area: "",
    verified: false,
    available: false
};


/*  
   EMERGENCY OPTIONS
  */

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


/*  
   CATEGORY ICONS
  */

const categoryIcons = {

    Medical: "🩺",
    Fire: "🔥",
    Accident: "🚗",
    Danger: "🛡️",
    Electrical: "⚡",
    Other: "🆘"

};


/*  
   SCREEN CONTROL
  */

function showScreen(screenId) {

    const screens =
        document.querySelectorAll(".screen");


    screens.forEach(screen => {

        screen.classList.remove("active");

    });


    const target =
        document.getElementById(screenId);


    if (target) {

        target.classList.add("active");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/*  
   HOME
  */

function goHome() {

    selectedCategory = "";
    selectedEmergency = "";
    customEmergencyDescription = "";

    emergencyId = null;
    currentHelper = null;

    showScreen("home");
}


/*  
   HOW IT WORKS
  */

function openHowItWorks() {

    showScreen("how-it-works");

}


/*  
   CATEGORY SELECTION
  */

function selectCategory(category) {

    selectedCategory = category;


    document.getElementById("categoryIcon")
        .textContent =
        categoryIcons[category] || "🚨";


    document.getElementById("categoryTitle")
        .textContent =
        `${category} Emergency`;


    const optionsContainer =
        document.getElementById(
            "emergencyOptions"
        );


    optionsContainer.innerHTML = "";


    const options =
        emergencyOptions[category] || [];


    options.forEach(option => {

        const button =
            document.createElement("button");


        button.className =
            "option-btn";


        button.textContent =
            option;


        button.onclick = function () {

            selectEmergencyOption(option);

        };


        optionsContainer.appendChild(button);

    });


    showScreen("category");
}


/*  
   EMERGENCY OPTION
  */

function selectEmergencyOption(option) {

    if (option.includes("Other")) {

        showScreen("other-description");


        document.getElementById(
            "customDescription"
        ).value = "";


        return;
    }


    selectedEmergency = option;


    showConfirmation();
}


/*  
   CUSTOM EMERGENCY
  */

function continueCustomEmergency() {

    const description =
        document.getElementById(
            "customDescription"
        )
        .value
        .trim();


    if (!description) {

        alert(
            "Please describe what is happening."
        );


        return;
    }


    customEmergencyDescription =
        description;


    selectedEmergency =
        "Other: " + description;


    showConfirmation();
}


/*  
   CONFIRMATION
  */

function showConfirmation() {

    document.getElementById(
        "confirmEmergency"
    ).textContent =
        selectedCategory;


    document.getElementById(
        "confirmDescription"
    ).textContent =
        selectedEmergency;


    showScreen("confirmation");
}


/*  
   BACKEND CATEGORY
  */

function getBackendCategory() {

    return selectedCategory.toLowerCase();

}


/*  
   REQUIRED SKILL
  */

function getRequiredSkill() {

    const text =
        selectedEmergency.toLowerCase();


    if (
        selectedCategory === "Medical" ||
        text.includes("unconscious") ||
        text.includes("injured") ||
        text.includes("pain") ||
        text.includes("breathing")
    ) {

        return "first_aid";

    }


    if (selectedCategory === "Fire") {

        return "fire_response";

    }


    if (selectedCategory === "Accident") {

        return "accident_response";

    }


    if (selectedCategory === "Danger") {

        return "safety_assistance";

    }


    if (selectedCategory === "Electrical") {

        return "electrical_assistance";

    }


    return "general_assistance";
}


/*  
   SEVERITY
  */

function getSeverity() {

    const text =
        selectedEmergency.toLowerCase();


    if (
        text.includes("unconscious") ||
        text.includes("breathing") ||
        text.includes("trapped") ||
        text.includes("electric shock") ||
        text.includes("fire")
    ) {

        return "critical";

    }


    return "high";
}


/*  
   GET USER LOCATION
  */

function getUserLocation() {

    return new Promise((resolve) => {

        if (!navigator.geolocation) {

            /*
               Demo fallback coordinates
            */

            resolve({

                latitude: 12.9716,
                longitude: 77.5946

            });


            return;
        }


        navigator.geolocation.getCurrentPosition(

            position => {

                resolve({

                    latitude:
                        position.coords.latitude,

                    longitude:
                        position.coords.longitude

                });

            },


            error => {

                console.log(
                    "Location unavailable:",
                    error
                );


                /*
                   Demo fallback
                */

                resolve({

                    latitude: 12.9716,

                    longitude: 77.5946

                });

            },


            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 60000
            }

        );

    });
}


/*  
   POST /emergency
  */

async function createEmergency() {

    const location =
        await getUserLocation();


    const emergencyData = {

        category:
            getBackendCategory(),

        severity:
            getSeverity(),

        required_skill:
            getRequiredSkill(),

        description:
            selectedEmergency,

        latitude:
            location.latitude,

        longitude:
            location.longitude

    };


    console.log(
        "POST /emergency",
        emergencyData
    );


    try {

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
                        JSON.stringify(
                            emergencyData
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Emergency response:",
            data
        );


        /*
           Person 1's backend should return:

           {
               "message": "...",
               "emergency_id": 1,
               "emergency": {...}
           }

           We support that structure.
        */


        if (data.emergency_id) {

            emergencyId =
                data.emergency_id;

        }


        /*
           Some backends may put the ID inside
           the emergency object.
        */

        else if (
            data.emergency &&
            data.emergency.id
        ) {

            emergencyId =
                data.emergency.id;

        }


        return data;


    } catch (error) {

        console.error(
            "POST /emergency failed:",
            error
        );


        alert(
            "Could not connect to the SAHAAYA backend.\n\nMake sure Person 1's FastAPI server is running and accessible."
        );


        return null;

    }

}


/*  
   REQUEST HELP
  */

async function requestHelp() {

    currentRadius = 150;


    document.getElementById(
        "radiusValue"
    ).textContent =
        "Detecting location...";


    document.getElementById(
        "findingMessage"
    ).textContent =
        "Sending emergency to SAHAAYA...";


    resetFindingTracker();


    showScreen("finding-help");


    /*
       STEP 1
       Create emergency
    */

    const emergencyResponse =
        await createEmergency();


    if (!emergencyResponse) {

        return;

    }


    /*
       Emergency successfully created.
    */

    document.getElementById(
        "findingMessage"
    ).textContent =
        "Emergency reported. Finding nearby help...";


    document.getElementById(
        "radiusValue"
    ).textContent =
        "Searching";


    /*
       STEP 2
       Get matching helpers
    */

    if (!emergencyId) {

        console.error(
            "No emergency ID received."
        );


        alert(
            "Emergency was created, but the backend did not return an emergency ID. Ask Person 1 to include emergency_id in the response."
        );


        return;

    }


    await findHelpers(emergencyId);
}


/*  
   GET /emergency/{id}/helpers
  */

async function findHelpers(id) {

    console.log(
        `GET /emergency/${id}/helpers`
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/emergency/${id}/helpers`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Helpers response:",
            data
        );


        /*
           Expected:

           {
               emergency_id: 1,
               status: "searching",
               helpers: [...]
           }
        */


        if (
            data.helpers &&
            data.helpers.length > 0
        ) {

            /*
               Use the first helper returned.
               Backend already sorts/matches helpers.
            */

            currentHelper =
                data.helpers[0];


            activateFindingResponder();


            document.getElementById(
                "findingMessage"
            ).textContent =
                "Suitable responder found!";


            document.getElementById(
                "radiusValue"
            ).textContent =
                `${currentHelper.distance} m`;


            setTimeout(
                showRealHelperFound,
                700
            );


        } else {

            /*
               No helper currently returned.

               We display the search status rather
               than inventing a fake responder.
            */

            currentRadius += 150;


            document.getElementById(
                "radiusValue"
            ).textContent =
                `${currentRadius} m`;


            document.getElementById(
                "findingMessage"
            ).textContent =
                "No suitable responder found yet. Searching a wider area...";


            /*
               Try once more after a short delay.

               Later Person 1 can handle radius
               escalation completely on the backend.
            */

            setTimeout(
                () => retryHelperSearch(id),
                2000
            );

        }


    } catch (error) {

        console.error(
            "GET helpers failed:",
            error
        );


        alert(
            "Could not retrieve nearby responders from the backend."
        );

    }

}


/*  
   RETRY HELPER SEARCH
  */

async function retryHelperSearch(id) {

    console.log(
        "Retrying helper search..."
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/emergency/${id}/helpers`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Retry helpers response:",
            data
        );


        if (
            data.helpers &&
            data.helpers.length > 0
        ) {

            currentHelper =
                data.helpers[0];


            activateFindingResponder();


            document.getElementById(
                "findingMessage"
            ).textContent =
                "Suitable responder found!";


            document.getElementById(
                "radiusValue"
            ).textContent =
                `${currentHelper.distance} m`;


            setTimeout(
                showRealHelperFound,
                700
            );


        } else {

            document.getElementById(
                "findingMessage"
            ).textContent =
                "No responder is currently available.";


            document.getElementById(
                "radiusValue"
            ).textContent =
                "Search complete";


            /*
               Don't keep retrying forever.
            */

            setTimeout(() => {

                alert(
                    "No suitable responder is currently available. The backend can later trigger radius escalation or official emergency escalation."
                );

                goHome();

            }, 1500);

        }


    } catch (error) {

        console.error(
            "Retry failed:",
            error
        );

        


        alert(
            "Could not retrieve responders."
        );

    }

}


/*  
   FINDING TRACKER
  */

function resetFindingTracker() {

    const responderTracker =
        document.getElementById(
            "trackerResponder"
        );


    const connectTracker =
        document.getElementById(
            "trackerConnect"
        );


    responderTracker.classList.remove(
        "active"
    );


    connectTracker.classList.remove(
        "active"
    );


    responderTracker.querySelector(
        ".status-dot"
    ).textContent =
        "3";


    connectTracker.querySelector(
        ".status-dot"
    ).textContent =
        "4";
}


function activateFindingResponder() {

    const responderTracker =
        document.getElementById(
            "trackerResponder"
        );


    responderTracker.classList.add(
        "active"
    );


    responderTracker.querySelector(
        ".status-dot"
    ).textContent =
        "✓";
}


/*  
   SHOW REAL HELPER
  */

function showRealHelperFound() {

    if (!currentHelper) {

        return;

    }


    const helperName =
        currentHelper.name ||
        "Nearby Responder";


    const helperSkill =
        currentHelper.skill ||
        "Emergency Assistance";


    const helperDistance =
        currentHelper.distance ??
        "Nearby";


    document.getElementById(
        "helperName"
    ).textContent =
        helperName;


    document.getElementById(
        "helperSkill"
    ).textContent =
        "🩺 Skill: " + helperSkill;


    document.getElementById(
        "helperDistance"
    ).textContent =
        helperDistance;


    showScreen(
        "helper-found"
    );
}


/*  
   ACCEPT MATCH
   POST /match/{id}/accept
  */

async function simulateResponderAccept() {

    /*
       IMPORTANT:

       This function name is kept because your
       existing HTML already calls it.

       It now performs the REAL backend accept call.
    */


    if (!emergencyId) {

        alert(
            "Emergency ID is missing."
        );


        return;

    }


    if (!currentHelper) {

        alert(
            "No responder has been selected."
        );


        return;

    }


    const helperId =
        currentHelper.id;


    if (!helperId) {

        alert(
            "Responder ID is missing from the backend response."
        );


        return;

    }


    console.log(
        `POST /match/${emergencyId}/accept`
    );


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/match/${emergencyId}/accept`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Accept response:",
            data
        );


        /*
           Expected:

           {
               emergency_id: 1,
               helper_id: 1,
               status: "accepted",
               message: "..."
           }
        */


        if (
            data.status &&
            data.status.toLowerCase() !==
                "accepted"
        ) {

            alert(
                data.message ||
                "The responder did not accept the emergency."
            );


            return;

        }


        /*
           Update responder status in the
           emergency timeline.
        */

        const connectTracker =
            document.getElementById(
                "trackerConnect"
            );


        connectTracker.classList.add(
            "active"
        );


        connectTracker.querySelector(
            ".status-dot"
        ).textContent =
            "✓";


        document.getElementById(
            "acceptedResponderName"
        ).textContent =
            currentHelper.name ||
            "Responder";


        showScreen(
            "emergency-status"
        );


    } catch (error) {

        console.error(
            "POST accept failed:",
            error
        );


        alert(
            "Could not accept the emergency through the backend."
        );

    }

}


/*  
   SPEAK
  */

function speakEmergency() {

    alert(
        "Voice input can be connected to AI/voice services later."
    );

}


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

function openResponderLogin() {

    /*
       DEMO LOGIN

       Actual responder authentication can be
       connected to the backend later.
    */


    if (!responder.verified) {

        responder = {

            name:
                "Demo Responder",

            phone:
                "0000000000",

            profession:
                "First-Aid Volunteer",

            skills:
                "First Aid",

            area:
                "Demo Area",

            verified:
                true,

            available:
                true

        };

    }


    openResponderDashboard();
}


/*  
   RESPONDER REGISTRATION
  */

function openResponderRegistration() {

    showScreen(
        "responder-registration"
    );

}


/*  
   SUBMIT REGISTRATION
  */

function submitRegistration() {

    const name =
        document.getElementById(
            "responderName"
        )
        .value
        .trim();


    const phone =
        document.getElementById(
            "responderPhone"
        )
        .value
        .trim();


    const profession =
        document.getElementById(
            "responderProfession"
        )
        .value;


    const skills =
        document.getElementById(
            "responderSkills"
        )
        .value
        .trim();


    const area =
        document.getElementById(
            "responderArea"
        )
        .value
        .trim();


    if (
        !name ||
        !phone ||
        !profession ||
        !skills ||
        !area
    ) {

        alert(
            "Please fill in all fields."
        );


        return;
    }


    responder = {

        name,
        phone,
        profession,
        skills,
        area,

        verified:
            false,

        available:
            false

    };


    showScreen(
        "verification-pending"
    );
}


/*  
   DEMO VERIFICATION
  */

function simulateVerification() {

    responder.verified =
        true;


    responder.available =
        true;


    alert(
        "Demo verification complete. You are now a verified responder."
    );


    openResponderDashboard();
}


/*  
   RESPONDER DASHBOARD
  */

function openResponderDashboard() {

    if (!responder.verified) {

        alert(
            "Your responder profile has not been verified yet."
        );


        showScreen(
            "verification-pending"
        );


        return;
    }


    document.getElementById(
        "responderWelcome"
    ).textContent =
        `Welcome, ${responder.name}`;


    document.getElementById(
        "availabilityToggle"
    ).checked =
        responder.available;


    updateAvailabilityUI();


    if (responder.available) {

        document.getElementById(
            "incomingEmergency"
        ).classList.remove(
            "hidden"
        );


        document.getElementById(
            "noEmergency"
        ).classList.add(
            "hidden"
        );

    } else {

        document.getElementById(
            "incomingEmergency"
        ).classList.add(
            "hidden"
        );


        document.getElementById(
            "noEmergency"
        ).classList.remove(
            "hidden"
        );

    }


    showScreen(
        "responder-dashboard"
    );
}


/*  
   AVAILABILITY
  */

function toggleAvailability() {

    if (!responder.verified) {

        alert(
            "Only verified responders can change availability."
        );


        document.getElementById(
            "availabilityToggle"
        ).checked =
            false;


        return;
    }


    responder.available =
        document.getElementById(
            "availabilityToggle"
        ).checked;


    updateAvailabilityUI();


    if (responder.available) {

        document.getElementById(
            "incomingEmergency"
        ).classList.remove(
            "hidden"
        );


        document.getElementById(
            "noEmergency"
        ).classList.add(
            "hidden"
        );

    } else {

        document.getElementById(
            "incomingEmergency"
        ).classList.add(
            "hidden"
        );


        document.getElementById(
            "noEmergency"
        ).classList.remove(
            "hidden"
        );

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


/*  
   ACCEPT EMERGENCY
  */

function acceptEmergency() {

    if (!responder.available) {

        alert(
            "You are currently unavailable."
        );


        return;

    }


    showScreen(
        "responder-accepted"
    );
}


/*  
   DECLINE EMERGENCY
  */

function declineEmergency() {

    showScreen(
        "responder-declined"
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
    function () {

        goHome();

    }
);
