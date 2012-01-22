function(doc) {
    // !code lib/fixtime.js
    if (doc.user_id && doc.session_id) {
        var time = fixtime(session_id);
        emit([doc.user_id,doc.time],null);
    }
};
