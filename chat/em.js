new EmojiPicker({
    trigger: [
        {
            selector: '.emoji',
            insertInto: ['#txt',] //If there is only one '.selector', than it can be used without array
        }
    ],
    closeButton: true,
    dragButton: true,
  
});