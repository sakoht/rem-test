
/*!
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com

Copyright (c) 2010 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */
(function() {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  Math.uuid = function (len, radix) {
    var chars = CHARS, uuid = [], i;
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  };

  // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
  // by minimizing calls to random()
  Math.uuidFast = function() {
    var chars = CHARS, uuid = new Array(36), rnd=0, r;
    for (var i = 0; i < 36; i++) {
      if (i==8 || i==13 ||  i==18 || i==23) {
        uuid[i] = '-';
      } else if (i==14) {
        uuid[i] = '4';
      } else {
        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
        r = rnd & 0xf;
        rnd = rnd >> 4;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
    return uuid.join('');
  };

  // A more compact, but less performant, RFC4122v4 solution:
  Math.uuidCompact = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };
})();




function (doc,req) {
    var flinkt_id_str = Math.uuid();

    var bookmarklet_text = function () {
        var b = "javascript:(function(){";
        b += "  if(document.getElementById('flinkt.org bookmarklet') == null) {";
        b += "    s=document.createElement('script');";
        b += "    s.flinkt_init_bookmarklet_id = '" + flinkt_id_str + "';";
        b += "    s.flinkt_init_session_id = Date();";
        b += "    s.setAttribute('type','text/javascript');";
        b += "    s.setAttribute('charset','UTF-8');";
        b += "    s.setAttribute('src','http://www.flinkt.org/static/js/selector.js?id=" + flinkt_id_str + "&date=' + s.flinkt_init_session_id);";
        b += "    s.setAttribute('id','flinkt.org bookmarklet');";
        b += "    document.body.appendChild(s);";
        b += "  }";
        b += "})();";
        return(b);
    };

    var s = '';
    s += '<h1>flinkt</h1>';
    s += '<ol>';
    s += '<li><a href="' + bookmarklet_text() + '">flinkt (' + flinkt_id_str + ')</a>   <==========   drag this link onto your bookmarks bar!</li>';
    s += '<li>go to any web site (or stay right here to try it)</li>';
    s += '<li>click the bookmark to turn on the flinkt pen ...it appears on the right</li>';
    s += '<li>select any statement to highlight it</li>';
    s += '<li>click any highlighted statement to see options like email, digg, facebook, google+, and twitter (NOT IMPLEMENTED)</li>';
    s += '<li>turn the pen on and off whenever you want by clicking on the image on the right (NOT IMPEMENTED)</li>';
    s += '<li>when you come back to the site, turn on the pen again to see your previous highlights (NOT IMPLEMENTED)</li>';
    s += '<li>click on the green arrow to see all of your highlights, see a capture of the page, and send them around (NOT IMPLEMENTED)</li>';
    s += '</ol>';
    return s;
}
