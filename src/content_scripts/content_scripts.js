console.log("____________________Content Script is alive __________________________")
const htmlDocumentValue = document.body.innerHTML
const htmlDocumentValueAsText = document.body.innerText

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    console.log("request gotten")
    if(request.action == "getAllHTML"){
        sendResponse({allHTML : {
            html : htmlDocumentValue,
            text : htmlDocumentValueAsText
        }})
    }else if(request.highlightWord){
        highlightText(request.highlightWord)
    }
})

function highlightText(phrase) {
    if (!phrase || typeof phrase !== 'string') {
        return;
    }

    // Fix the incorrect quote replacement
    phrase = phrase.replaceAll("'revealQuote", '"');

    // Escape special characters in the phrase to avoid regex issues
    const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Modified regex to properly exclude existing marks
    const regex = new RegExp(`(?<!<mark[^>]*>)${escapedPhrase}(?![^<]*<\/mark>)`, "gi");
    
    let firstHighlightedElement = null;

    // Traverse all text nodes in the document
    function walkThroughNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue;
            // Reset regex lastIndex to ensure proper testing
            regex.lastIndex = 0;
            
            if (regex.test(text)) {
                // Reset lastIndex again for the replacement
                regex.lastIndex = 0;
                
                const span = document.createElement("span");
                span.className = "highlight";
                
                // Create a temporary container for the HTML content
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = text.replace(regex, '<mark>$&</mark>');
                
                // Use innerHTML to parse the HTML, then move the nodes
                while (tempContainer.firstChild) {
                    span.appendChild(tempContainer.firstChild);
                }
                
                node.parentNode.replaceChild(span, node);

                if (!firstHighlightedElement) {
                    firstHighlightedElement = span.querySelector("mark");
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Skip if the node is already a mark element or is in a script/style tag
            if (node.nodeName.toLowerCase() === 'mark' || 
                node.nodeName.toLowerCase() === 'script' || 
                node.nodeName.toLowerCase() === 'style') {
                return;
            }
            
            // Convert live NodeList to Array to avoid modification issues
            Array.from(node.childNodes).forEach(walkThroughNodes);
        }
    }

    try {
        Array.from(document.body.childNodes).forEach(walkThroughNodes);

        if (firstHighlightedElement) {
            firstHighlightedElement.scrollIntoView({ 
                behavior: "smooth", 
                block: "center",
                inline: "nearest"
            });
        }
    } catch (error) {
        console.error('Error while highlighting text:', error);
    }

    return firstHighlightedElement;
}