// Logic for displaying the HTML dialogue box with a typewriter effect
export function displayDialogue(text, onDisplayEnd) {
    const dialogUI = document.getElementById("textbox");
    const content = document.getElementById("content");

    dialogUI.style.display = "block";
    
    let index = 0;
    let currentText = "";
    content.innerText = ""; // Clear existing text

    // Clear any previous interval if the player spammed the key
    if (window.dialogueInterval) clearInterval(window.dialogueInterval);

    // Create the typewriter effect
    window.dialogueInterval = setInterval(() => {
        if (index < text.length) {
            currentText += text[index];
            content.innerText = currentText;
            index++;
        } else {
            clearInterval(window.dialogueInterval); // Stop when finished
        }
    }, 20); // 20ms per character (adjust for speed)

    // Function to close the box
    function onClose() {
        onDisplayEnd(); // Callback to unfreeze player
        dialogUI.style.display = "none";
        clearInterval(window.dialogueInterval); // Stop typing if closed early
    }

    return onClose;
}