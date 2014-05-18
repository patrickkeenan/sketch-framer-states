// Preamble
var app = [COScript application:"Sketch"],
    windows = [app windows]

var log = print

for (var i=0; i<[windows count]; i++) {
   var window = windows[i]
   if ([window document]) {
     var doc = [window document]
   }
}
