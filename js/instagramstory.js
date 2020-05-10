window.onload = function(){
    html2canvas(document.getElementById('capture-area'), {
      letterRendering: 1,
      allowTaint: true,
      backgroundColor: 'transparent',
      useCORS: true
    } ).then(
      function(canvas) {
        let 
        // previewButton = document.getElementById('btn-preview-image'),
            downloadButton = document.getElementById('btn-download'),
            captureArea = document.getElementById('capture-area'),
            imgageData = canvas.toDataURL("image/png");
            // Now browser starts downloading it instead of just showing it
            imgageData = imgageData.replace(/^data:image\/png/, "data:application/octet-stream");
        // previewButton.removeAttribute('disabled');
        downloadButton.setAttribute('download', 'instagramStory.png');
        downloadButton.setAttribute('href', imgageData);

        // previewButton.addEventListener('click', function(){
        //   document.getElementById('previewImage').appendChild(canvas);
        // });
        
        downloadButton.addEventListener('click', function(){
          if (capturedData === void 0) {
            alert("Please preview before downloading.");
          }
        });
      }
    );
  }