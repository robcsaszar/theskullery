function copyText() {
    var outputText = "";
    var items = document.getElementsByClassName('ingredient unchecked');

    // BEGIN - supplement to the original code
    Array.from(items).forEach(pnode => {
      // Complement this selector to remove whatever is unwanted.
      // '*' removes all child elements.
      let nodelist_toBlank = pnode.querySelectorAll('em');

      // Blank the unwanted content, saving the original Css property value
      Array.from(nodelist_toBlank).forEach(pnode_toBlank => {
        pnode_toBlank.setAttribute('data-style-display', pnode_toBlank.style.display);
        pnode_toBlank.style.display = 'none';
      });

      // Add data from node to the string buffer. Elements with Css 'display' property set to 'none' are skipped
      outputText += pnode.innerText + "\n";

      // Unblank. Restore the original Css property value
      Array.from(nodelist_toBlank).forEach(pnode_toRestore => {
        pnode_toRestore.style.display = pnode_toRestore.getAttribute('data-style-display');
        pnode_toRestore.removeAttribute('data-style-display');
      });
    });
    // END - supplement to the original code
    //
    // Original loop deleted!

    var output = document.getElementById('output');
    output.innerText = outputText;
    var range = document.createRange();
    range.selectNodeContents(output);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    document.getElementById("copyText").innerHTML = 'Copied!'
    output.style.display = 'none';
  }