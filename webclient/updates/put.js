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
    return [doc, msg]
}

