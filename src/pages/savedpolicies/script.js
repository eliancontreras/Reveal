const allPoliciesContainer = document.querySelector(".saved-policies-container");
const closeSvg = `<svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
<rect width="22" height="22" rx="5"/>
<path d="M8.5 7.5L14.5 13.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.5 13.5L14.5 7.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

async function init() {
    const savedPolicies = await chrome.storage.local.get(["revealSavedPolicies"]);
    const savedPoliciesInStorage = savedPolicies.revealSavedPolicies || [];

    if(savedPoliciesInStorage.length == 0){
        allPoliciesContainer.innerHTML = `
        <p class="empty">Seems like you haven't saved any policies yet</p>
        `
        return
    }

    // Clear the container first
    allPoliciesContainer.innerHTML = "";

    savedPoliciesInStorage.forEach((policy) => {
        let mainDiv = document.createElement("div");
        mainDiv.className = "single-saved-policy";

        // Join the mapped `policy.summary` to create a single HTML string
        const summaryHTML = policy.summary.map((p) => {
            return `
                <div class="single-summary">
                    <h1>${p.title}</h1>
                    <p>${p.description}</p>
                </div>`;
        }).join("");  // Convert array to a single string


        mainDiv.innerHTML = `
            <div class="single-policy-left">
                <div class="random-gradient ${policy.tag}"></div>
            </div>

            <div class="single-policy-right">
                <div class="single-policy-top">                     
                    <h1>${policy.title}</h1>
                    <button class="right">
                        <img src="../../assets/icons/delete-icon-light.svg" alt="delete icon" title="delete">
                    </button>
                </div>

                <div class="single-policy-bottom">
                    <p>${policy.summary.length} data collected</p>
                    <p>•</p>
                    <p>${policy.date}</p>
                    <p>•</p> 
                    <button>
                        View Details
                    </button>
                </div>
            </div>

            <div class="policy-modal">
                <button class="close">
                    ${closeSvg}
                </button>

                <div class="modal">
                    <div class="modal-header">
                        <div class="random-gradient ${policy.tag}"></div>
                        <h1>${policy.title}</h1>
                    </div>

                    <div class="summary-container">
                        ${summaryHTML}  <!-- Inject the generated summary here -->
                    </div>
                </div>
            </div>
        `;

        // Append the `mainDiv` to the `allPoliciesContainer`
        allPoliciesContainer.appendChild(mainDiv)

        const displayModal = mainDiv.querySelector(".single-policy-bottom button")

        const closeModal = mainDiv.querySelector(".policy-modal .close")

        const policyModal = mainDiv.querySelector(".policy-modal")

        const deleteButton = mainDiv.querySelector(".single-policy-top button.right")

        displayModal.addEventListener("click", ()=>{
            policyModal.classList.add("open")
        })

        closeModal.addEventListener("click", ()=>{
            policyModal.classList.remove("open")
        })

        deleteButton.addEventListener("click", async ()=>{
            console.log(policy)

        const newSavedPolicies = savedPoliciesInStorage.filter((item) => item.id !== policy.id)

        await chrome.storage.local.set({revealSavedPolicies : newSavedPolicies})

        init()
        })
    });
}

init();
