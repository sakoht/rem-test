function(doc) {
  if (doc.user_id && doc.url) {
    emit([doc.user_id,doc.domain], null);
  }
};
