root = document.documentElement;
root.style.setProperty('--changex', randominclusive(0,1000) + "px"); 
root.style.setProperty('--changey', randominclusive(0,1000) + "px"); 
setTimeout(
    function()
    { 
        root.style.setProperty('--changex', randominclusive(0,1000) + "px"); 
        root.style.setProperty('--changey', randominclusive(0,1000) + "px"); 
    },20000
);

function randominclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}