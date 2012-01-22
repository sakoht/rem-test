function fixtime(session_id) {
    if (session_id) { 
        parts = session_id.split(' '); 
        return [session_id, parts[3],parts[1],parts[2],parts[4],parts[5],parts[6],parts[0]]; 
    }
}

