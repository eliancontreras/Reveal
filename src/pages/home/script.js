const policyForm = document.querySelector(".policy-form")
const policyTextarea = document.querySelector(".policy-textarea")
const allMessages = []
const chatBody = document.querySelector(".chat-body")
const baseUrl = "https://reveal-backend.onrender.com"
const summaryOptionsToggle = document.querySelector(".active-option")
const optionsModal = document.querySelector(".modal")
const optionsButtons = document.querySelectorAll(".modal-options > button")
const generateSummaryButton = document.querySelector(".policy-form .primary")
let policySource = summaryOptionsToggle.innerText
const inputArea = document.querySelector(".input-section")
const saveSvg = `<svg viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_50_209)">
<path d="M4.75 5.25H1.25C1.11739 5.25 0.990215 5.19732 0.896447 5.10355C0.802678 5.00979 0.75 4.88261 0.75 4.75V1.25C0.75 1.11739 0.802678 0.990215 0.896447 0.896447C0.990215 0.802678 1.11739 0.75 1.25 0.75H4L5.25 2V4.75C5.25 4.88261 5.19732 5.00979 5.10355 5.10355C5.00979 5.19732 4.88261 5.25 4.75 5.25Z" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4.25 5.25V3.25H1.75V5.25" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1.75 0.75V2H3.75" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_50_209">
<rect width="6" height="6" fill="white"/>
</clipPath>
</defs>
</svg>
`

//initial function
init(policySource)

//eventListeners
policyForm.addEventListener("submit", async (e)=>{
    e.preventDefault()
    const pastedValue = policyTextarea.value.trim()
    if(policySource == "Extract From Page"){
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true})
        const response = await chrome.tabs.sendMessage(tab.id, {action: "getAllHTML"})

        const pageHTMLValue = response.allHTML.html
        const pageHTMLValueAsText = response.allHTML.text

        const userMessageAsObj = {
            id : Date.now(),
            from : "user",
            value : pageHTMLValueAsText
        }
    
        const aiMessageAsObj = {
            id : Date.now(),
            from : "ai",
            source : policySource,
            value : pageHTMLValue
        }
    
        allMessages.push(userMessageAsObj, aiMessageAsObj)
        renderDiv(userMessageAsObj)
        renderDiv(aiMessageAsObj)
        policyTextarea.value = ""
    }else if(policySource == "Paste Manually"){
        if(!pastedValue) return
    
        const userMessageAsObj = {
            id : Date.now(),
            from : "user",
            value : pastedValue
        }
    
        const aiMessageAsObj = {
            id : Date.now(),
            from : "ai",
            source : policySource,
            value : userMessageAsObj.value
        }
    
        allMessages.push(userMessageAsObj, aiMessageAsObj)
        renderDiv(userMessageAsObj)
        renderDiv(aiMessageAsObj)
        policyTextarea.value = ""
    }
})

summaryOptionsToggle.addEventListener("click", (e)=>{
    optionsModal.classList.toggle("open")
})

optionsButtons.forEach((button)=>{
    button.addEventListener("click", (e)=>{
        policySource = e.currentTarget.innerHTML
        updatePolicySourceUi(policySource)
        updateTextareaUI(policySource)
        optionsModal.classList.remove("open")
    })
})

//render functions
function renderDiv({from , value, source}){
    if(from == "user"){
        renderNewUserMessage(value)
    }else if(from == "ai"){
        if(source == "Paste Manually"){
            startAiMessageProcessingFromPaste(value)
        }else if(source == "Extract From Page"){
            startAiMessageProcessingFromPage(value)
        }
    }else{
        alert("wrong type passed")
    }
}

function renderNewUserMessage(value){
    const userDiv = document.createElement("div")
    userDiv.className = "user-message"
    userDiv.innerHTML = `<div class="user-bubble">
                <p>${value}</p>
            </div>

            <div class="user-icon"></div>`
    chatBody.appendChild(userDiv)
}

function renderAiMessageSkeleton(){
    const skeletonDiv = document.createElement("div")
    skeletonDiv.className = "reveal-ai-skeleton"
    skeletonDiv.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="skeleton-response"></div>`
    chatBody.appendChild(skeletonDiv)
    skeletonDiv.scrollIntoView({
        block : "start",
        inline : "nearest",
        behavior : "smooth"
    })

    return skeletonDiv
}

function renderErrorUiFromPage(value){
    console.log(value)
    const errorDiv = document.createElement("div")
    errorDiv.className = "reveal-ai-error-bubble"
    const button = document.createElement("button")
    button.addEventListener("click", ()=>{
        errorDiv.remove()
        startAiMessageProcessingFromPage(value)
    })
    button.textContent = "Retry"
    errorDiv.innerHTML = `
            <p>Oops, seems like an error occurred when we tried to generate your policy summary, please try again</p>`
    errorDiv.appendChild(button)
    chatBody.appendChild(errorDiv)
}

function renderErrorUiFromPaste(value){
    console.log(value)
    const errorDiv = document.createElement("div")
    errorDiv.className = "reveal-ai-error-bubble"
    const button = document.createElement("button")
    button.addEventListener("click", ()=>{
        errorDiv.remove()
        startAiMessageProcessingFromPaste(value)
    })
    button.textContent = "Retry"
    errorDiv.innerHTML = `
            <p>Oops, seems like an error occurred when we tried to generate your policy summary, please try again</p>`
    errorDiv.appendChild(button)
    chatBody.appendChild(errorDiv)
}

function renderAiSummaryFromPaste(summaryObj){
    const  messageDiv = document.createElement("div")
    messageDiv.className = "reveal-ai-message"
    const summaryTitle = `Privacy Policy Summary for ${summaryObj.title}`
    let allSingleSummary =  ``

    summaryObj.summary.forEach((summary)=>{
            allSingleSummary += `<div class="single-summary">
                            <h1>${summary.title}</h1>
        
                            <p>${summary.description}</p>
    
                        </div>`
    })

    messageDiv.innerHTML = ` <img src="../../assets/images/reveal-chat-icon-${AppGlobals.appTheme == "light" ? "light" : "dark"}.png" alt="reveal chat icon" class="reveal-icon">

            <div class="reveal-ai-bubble">
                <div class="reveal-bubble-header"> <h1>${summaryTitle}</h1></div>

                <div class="summaries-container">
                    ${allSingleSummary}
                </div>

                <div class="reveal-bubble-footer"> 
                    <button class="save-container"> 

                    ${saveSvg}

                    <h3>Save</h3>
                    </button> 
                </div>
    </div>`

    const saveButton = messageDiv.querySelector(".save-container")

    saveButton.addEventListener("click", async (e)=>{
        await savePolicyToStorage(summaryObj)
        const oldValue = saveButton.innerHTML 
        saveButton.innerHTML = `<h3>Saved</h3>`

        setTimeout(() => {
            saveButton.innerHTML = oldValue
        }, 1500);
    })

    chatBody.appendChild(messageDiv)

    messageDiv.scrollIntoView({
        block : "start",
        inline : "nearest",
        behavior : "smooth"
    })
}

function renderAiSummaryFromPage(summaryObj){
    const  messageDiv = document.createElement("div")
    messageDiv.className = "reveal-ai-message"
    const summaryTitle = `Privacy Policy Summary for ${summaryObj.title}`
    let allSingleSummary =  ``

    summaryObj.summary.forEach((summary)=>{
            allSingleSummary += `<div class="single-summary">
                            <h1>${summary.title}</h1>
        
                            <p>${summary.description}</p>
        
                            <button data-phrase="${summary.exactPhrase.replaceAll(`"`, `'revealQuote`)}" class="secondary-button">View on page</button>
                        </div>`
    })

    messageDiv.innerHTML = `<img src="../../assets/images/reveal-chat-icon-${AppGlobals.appTheme == "light" ? "light" : "dark"}.png" alt="reveal chat icon" class="reveal-icon">

            <div class="reveal-ai-bubble">
                <div class="reveal-bubble-header"> <h1>${summaryTitle}</h1></div>

                <div class="summaries-container">
                    ${allSingleSummary}
                </div>

                <div class="reveal-bubble-footer"> 
                    <button class="save-container"> 

                    ${saveSvg}

                    <h3>Save</h3></button> 
                </div>
    </div>`

    const viewOnPageButtons = messageDiv.querySelectorAll(".secondary-button")

    viewOnPageButtons.forEach((button)=>{
        button.addEventListener("click", async (e)=>{
            const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true})
            await chrome.tabs.sendMessage(tab.id, {highlightWord: e.target.dataset.phrase})
            console.log(e.target.dataset.phrase)
        })
    })

    const saveButton = messageDiv.querySelector(".save-container")

    saveButton.addEventListener("click", async (e)=>{
        await savePolicyToStorage(summaryObj)
        const oldValue = saveButton.innerHTML 
        saveButton.innerHTML = `<h3>Saved</h3>`

        setTimeout(() => {
            saveButton.innerHTML = oldValue
        }, 1500);
    })

    chatBody.appendChild(messageDiv)
    messageDiv.scrollIntoView({
        block : "start",
        inline : "nearest",
        behavior : "smooth"
    })
}

//state functions
function toggleInputState(){
    inputArea.classList.toggle("loading")
}

function updatePolicySourceUi(value){
    summaryOptionsToggle.innerHTML = `${value} <img src= ../../assets/icons/view-more-${AppGlobals.appTheme == "light" ? "light" : "dark"}.svg alt="view more">`
}

function updateTextareaUI(value){
    if(value == "Extract From Page"){
        policyTextarea.setAttribute("disabled", true)
        generateSummaryButton.innerText = "Generate From Page"
    }else if(value == "Paste Manually"){
        policyTextarea.removeAttribute("disabled")
        generateSummaryButton.innerText = "Generate Summary"
    }else{
        alert("Wrong type passed")
    }
}

//processing functions
async function startAiMessageProcessingFromPaste(value){
    toggleInputState()
    const skeletonDiv = renderAiMessageSkeleton()
    try{
        const rawFetch = await fetch(`${baseUrl}/api/summary`, {
            method : "POST",
            body : JSON.stringify({
                privacyPolicy : value
            }),
            headers : {
                "Content-Type" : "application/json"
            }
        })

        const responseInJson = await rawFetch.json()

        if(!rawFetch.ok || responseInJson.status == "error"){
            throw new Error("an error ocurred", {cause : responseInJson})
        }

        skeletonDiv.remove()

        renderAiSummaryFromPaste(responseInJson)
    }
    catch(err){
        skeletonDiv.remove()
        renderErrorUiFromPaste(value)
        console.error(err)
    }
    finally{
        toggleInputState()
    }
}

async function startAiMessageProcessingFromPage(value){
    toggleInputState()
    const skeletonDiv = renderAiMessageSkeleton()
    try{
        const rawFetch = await fetch(`${baseUrl}/api/summary/page`, {
            method : "POST",
            body : JSON.stringify({
                privacyPolicy : value
            }),
            headers : {
                "Content-Type" : "application/json"
            }
        })

        const responseInJson = await rawFetch.json()

        if(!rawFetch.ok || responseInJson.status == "error"){
            throw new Error("an error ocurred", {cause : responseInJson})
        }

        skeletonDiv.remove()

        renderAiSummaryFromPage(responseInJson)

    }
    catch(err){
        skeletonDiv.remove()
        renderErrorUiFromPage(value)
        console.error(err)
    }
    finally{
    toggleInputState()
    }
}

//normal functions
async function savePolicyToStorage(policyObj){
    const previous = await chrome.storage.local.get(["revealSavedPolicies"])

    const previousValueInStorage = await previous.revealSavedPolicies || []

    policyObj.tag = randomTag()

    policyObj.id = Date.now()

    const d = new Date()

    policyObj.date = d.toDateString()

    const newValue = [
        ...previousValueInStorage,
        policyObj
    ]

    await chrome.storage.local.set({revealSavedPolicies : newValue})
}

function randomTag(){
    const tags = ["red", "green", "blue", "yellow"]
    const randomIndex = Math.ceil(Math.random() * tags.length - 1)

    return tags[randomIndex]
}

async function init(initialValue){
    updateTextareaUI(initialValue)
}