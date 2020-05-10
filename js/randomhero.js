var images = ['/assets/headers/header1.jpg',
'/assets/headers/header2.jpg',
'/assets/headers/header3.jpg',
'/assets/headers/header4.jpg',
'/assets/headers/header5.jpg',
'/assets/headers/header6.jpg',
'/assets/headers/header7.jpg',
'/assets/headers/header8.jpg',
'/assets/headers/header9.jpg',
'/assets/headers/header10.jpg'
];

var randomImage = Math.floor(Math.random() * 10)

$(document).ready(function () {
$("#hero").css("background-image", "url('" + images[randomImage] + "')");
})