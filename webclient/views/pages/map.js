function(doc) {
  if (doc.content) {
    emit(doc._id, null);
  }
};
