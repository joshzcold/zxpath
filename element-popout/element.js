// document.onclick = function() {
//     var x = document.getElementById('dropdownMenuButton');
//     if (x.style.visibility == "visible") 
//         x.style.visibility = "hidden";
//     else
//         x.style.visibility = "visible";

//     if (x.style.left == "150px") {
//         x.style.left = "10px";
//         x.style.top = "10px";
//     } else {
//         x.style.left = "150px";
//         x.style.top = "150px";}
// }

// document.getElementById('dropdownMenuButton').addEventListener('focus', customDropdownShow);
// document.getElementById('dropdownMenuButton').addEventListener('blur', customDropdownHide);

document.getElementById('dropdownMenuButton').onclick = function (e) {
    document.getElementById('dropdown-tooltip').style.visibility = "visible";
}

document.onclick = function (e) {
    var tooltip = document.getElementById('dropdown-tooltip');
    if (!(e.target.id == "dropdownMenuButton" || e.target.id == "dropdown-tooltip"))
        document.getElementById('dropdown-tooltip').style.visibility = "hidden";
    if (!document.getElementById('dropdown-tooltip').contains(e.target))
        document.getElementById('dropdown-tooltip').style.visibility = "hidden";
}

// function customDropdownShow() {
//     var dropbutton = document.getElementById('dropdownMenuButton');
//     var dropmenu = document.getElementById('dropdownMenuButton');
    
//     document.body.classList.add("show");
//     dropmenu.classList.add("show");
//     dropbutton.getAttribute("aria-expanded") = "true";
//     dropmenu.style.display = "block";
// }

// function customDropdownHide() {
//     var dropbutton = document.getElementById('dropdownMenuButton');
//     var dropmenu = document.getElementById('dropdownMenuButton');
    
//     dropbutton.getAttribute("aria-expanded") = "false";
//     dropmenu.classList.remove("show");
//     document.body.classList.remove("show");
//     // dropmenu.style.display = "hidden";
// }

