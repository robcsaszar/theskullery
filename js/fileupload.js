  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyAg1mUVs87yOQ-VJi_o5PYq3gLWl_6Lh1Q",
    authDomain: "the-skullery.firebaseapp.com",
    databaseURL: "https://the-skullery.firebaseio.com",
    projectId: "the-skullery",
    storageBucket: "the-skullery.appspot.com",
    messagingSenderId: "849862452241",
    appId: "1:849862452241:web:d3dcad30f48eaf13437db0",
    measurementId: "G-MZLE1B6FKQ"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  const storageService = firebase.storage();
  const storageRef = storageService.ref();

  document.querySelector('.file-select').addEventListener('change', handleFileUploadChange);
  document.querySelector('.file-submit').addEventListener('click', handleFileUploadSubmit);
  let selectedFile;

  function handleFileUploadChange(e) {
    selectedFile = e.target.files[0];
  };

  function handleFileUploadSubmit(e) {
    const uploadTask = storageRef.child(`recipes/${selectedFile.name}`).put(
      selectedFile); //create a child directory called images, and place the file inside this directory
    uploadTask.on('state_changed', (snapshot) => {
      // Observe state change events such as progress, pause, and resume
    }, (error) => {
      // Handle unsuccessful uploads
      var uploadFailed =
        "<div class='failed'><span class='closebtn' onclick='this.parentElement.style.display=\"none\";'>&times;</span><strong>Upload failed.</strong> Your file was not uploaded, please make sure you are uploading only template files. For other issues please <a class='squiggly--url' href='mailto:robert@nhg.design'>send me an e-mail</a>.</div>";
      $('#filesubmit').find('.messages').html(uploadFailed);
    }, () => {
      // Do something once upload is complete
      var uploadSuccess =
        "<div class='success'><span class='closebtn' onclick='this.parentElement.style.display=\"none\";'>&times;</span><strong>Success!</strong> Your file was uploaded, which means you\'re one step away from having your recipe displayed.</div>";
      $('#filesubmit').find('.messages').html(uploadSuccess);
      var request = new XMLHttpRequest();
      request.open("POST", "https://discordapp.com/api/webhooks/703957505964900482/eUGQoi_v6Og0zZId7woGURp6CSkr-MYZu_7E3pPx4QCnYuMj9X29IOjU4OvZaA6CTBgs");

      request.setRequestHeader('Content-type', 'application/json');

      var params = {
        username: "",
        avatar_url: "",
        content: "Someone submitted a recipe <@109375609406230528>! 🔥 Check it out here: https://console.firebase.google.com/u/2/project/the-skullery/storage/the-skullery.appspot.com/files"
      }

      request.send(JSON.stringify(params));

    });
  };
  $('#file-upload').bind('change', function () {
    var fileName = '';
    fileName = $(this).val().replace("C:\\fakepath\\", "");
    $('#file-selected').html(fileName);
  })