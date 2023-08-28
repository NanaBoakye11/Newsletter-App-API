/*************** When "Learn More" is clicked at bottom section **************/
var btnInfoDisplay = document.getElementById('info-display');

var bottomBtn = document.querySelector('#charity-btn');

var buttonClicked = bottomBtn.addEventListener("click", function() {
    btnInfoDisplay.style.display = "block";
});




/*************** When "Services" is clicked at middle section **************/

// get amount of images in service section **/

 var imageOptions = document.querySelectorAll('.service-img').length;

 for (var i = 0; i < imageOptions; i++) {
    document.querySelectorAll(".service-img")[i].addEventListener("click", function(event){
    $(this).parent().find("p").slideToggle("show-para");
             
      console.log($(this).parent().find("p").addClass("show-para"));
    });
}