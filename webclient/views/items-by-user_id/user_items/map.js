function(doc) {
  if (doc.user_id && doc.url) {
    emit(doc.user_id,[doc.session_id,doc.url,doc.page_sha1,doc.text]);
  }
};
