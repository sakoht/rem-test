function (doc, req) {
    var msg;
    if (!doc) {
        doc = { _id: req.id };
        msg = 'created';
    }   
    else {
        msg = 'updated';
    }
    for (k in req.form) {
        doc[k] = req.form[k]
    }
    return [doc, '<script src="/_utils/script/jquery.js"></script><script src="/js/jquery.ba-postmessage.js"></script><script>var p = $.postMessage("ok"); alert(p);</script>'];
}

