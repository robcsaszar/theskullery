function sendMessage() {
    var request = new XMLHttpRequest();
    var title = document.getElementsByTagName("title")[0].innerHTML;
    var page = title.split(" | ").slice(1, 2)
    console.log(page)
    document.getElementById("clapText").innerHTML = 'Thank you!'
    request.open("POST",
      "https://discordapp.com/api/webhooks/699980118013116426/L2jqPh9nx1q1cRxiGOQfSJFTDms4pdFJBfAu7f-kGkavwvLTrDtOI63uMv60MMkdTa6Z"
    );

    request.setRequestHeader('Content-type', 'application/json');

    var params = {
      username: "",
      avatar_url: "",
      content: "Someone clapped to your '" + page + "' recipe! 👏"
    }

    request.send(JSON.stringify(params));
  }