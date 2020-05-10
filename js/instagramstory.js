window.onload = function () {
  html2canvas(document.getElementById('capture-area'), {
    letterRendering: 1,
    allowTaint: true,
    backgroundColor: 'transparent',
    useCORS: true
  }).then(
    function (canvas) {
      let
      downloadButton = document.getElementById('btn-download'),
      imgageData = canvas.toDataURL("image/png");
      imgageData = imgageData.replace(/^data:image\/png/, "data:application/octet-stream");
      downloadButton.setAttribute('download', 'instagramStory.png');
      downloadButton.setAttribute('href', imgageData);
    }
  );
}