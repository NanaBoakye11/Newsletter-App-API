
/*****
var modal = document.getElementsByClassName("bottom-section");

var btn = document.getElementById("serviceBtn");

var buttonClicked = btn.addEventListener("click", function(){
    modal.style.display = block;
})
*******/

/*************** When "Learn More" is clicked at bottom section **************/
var btnInfoDisplay = document.getElementById('info-display');

var bottomBtn = document.querySelector('#charity-btn');

var buttonClicked = bottomBtn.addEventListener("click", function() {
    btnInfoDisplay.style.display = "block";
});


/*************** $(".service-img").click(function(event){
    $(this).parent().find("p").css("display", "block");
    console.log(event);  
}); 

 When "Services" is clicked at top section **************/

/* var serviceSection = document.getElementsByClassName('middle-section');
var serviceBtn = document.getElementById('serviceBtn');

var serviceBtnClicked = serviceBtn.addEventListener("click", function(){
   serviceSection. .display =;    //
})


/*************** When "Services" is clicked at middle section **************/

// get amount of images in service section **/


 var imageOptions = document.querySelectorAll('.service-img').length;

 for (var i = 0; i < imageOptions; i++) {
    document.querySelectorAll(".service-img")[i].addEventListener("click", function(event){
    $(this).parent().find("p").slideToggle("show-para");
       

     /*** $(this).parent().find("p").class.toggle("show-para"); *****/   
      
      console.log($(this).parent().find("p").addClass("show-para"));
    });
}